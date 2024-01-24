import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { FetchError } from "src/api/query.type";
import { useQueriesErrorBehavior } from "src/api/useQueriesError";
import UsersApi from "src/api/Users";
import SEO from "src/components/SEO";
import { Toaster } from "src/components/Toaster";
import Tooltip from "src/components/Tooltip";
import { usePosthog } from "src/hooks/usePosthog";
import Footer from "./Footer";
import Header from "./Header";
import Profile from "./Profile";

const PublicProfilePage = () => {
  const { userLogin } = useParams();
  const { capture } = usePosthog();

  const { data: userProfile, ...restUserProfileByGithubLoginQueries } = UsersApi.queries.useUserProfileByGithubLogin({
    params: { login: userLogin },
    options: { retry: 1 },
  });

  useEffect(() => {
    if (userProfile) {
      capture("contributor_viewed", { id: userProfile.id, type: "full" });
    }
  }, [userProfile]);

  const errorHandlingComponent = useQueriesErrorBehavior({
    queries: {
      error: restUserProfileByGithubLoginQueries.error as FetchError,
      isError: restUserProfileByGithubLoginQueries.isError,
      refetch: restUserProfileByGithubLoginQueries.refetch,
    },
  });

  if (errorHandlingComponent) {
    return errorHandlingComponent;
  }

  return userProfile && userLogin ? (
    <>
      <SEO title={`${userProfile.login} — OnlyDust`} />
      <div className="bg-public-profile lg:h-[calc(100dvh)] lg:w-screen">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-between md:px-4">
          <Header userLogin={userLogin} />
          <Profile userProfile={userProfile} />
          <Footer />
        </div>
      </div>
      <Toaster />
      <Tooltip />
    </>
  ) : (
    <></>
  );
};

export default PublicProfilePage;

import { withAuthenticationRequired } from "@auth0/auth0-react";
import { ReactElement } from "react";

import ProjectsLoader from "src/App/Loaders/ProjectsLoader";

function AuthenticationGuard({ children }: { children: ReactElement }) {
  return children;
}

export default withAuthenticationRequired(AuthenticationGuard, {
  onRedirecting: () => <ProjectsLoader />,
});

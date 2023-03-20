import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import FilterPanel, { GET_ALL_FILTER_OPTIONS_QUERY } from ".";
import { renderWithIntl, MemoryRouterProviderFactory } from "src/test/utils";
import { GetAllFilterOptionsQuery } from "src/__generated/graphql";
import { MockedResponse } from "@apollo/client/testing";
import {
  MockedProjectFilterProvider,
  Ownership,
  ProjectFilter,
  ProjectFilterProvider,
} from "src/pages/Projects/useProjectFilter";

expect.extend(matchers);

const projects1: GetAllFilterOptionsQuery["projects"][number] = {
  __typename: "Projects",
  id: "project-1",
  githubRepos: [
    {
      __typename: "ProjectGithubRepos",
      githubRepoId: 1,
      githubRepoDetails: {
        __typename: "GithubRepoDetails",
        id: 1,
        languages: { "C++": 1234, Shell: 123, Makefile: 10 },
      },
    },
  ],
  projectSponsors: [{ sponsor: { id: "sponsor-1", name: "Sponsor 1" } }],
  budgets: [{ __typename: "Budgets", id: "budget-1" }],
  projectLeads: [{ __typename: "ProjectLeads", userId: "user-1" }],
  pendingInvitations: [],
};

const projects2: GetAllFilterOptionsQuery["projects"][number] = {
  __typename: "Projects",
  id: "project-2",
  githubRepos: [
    {
      __typename: "ProjectGithubRepos",
      githubRepoId: 2,
      githubRepoDetails: {
        __typename: "GithubRepoDetails",
        id: 2,
        languages: { Rust: 1234, Shell: 123 },
      },
    },
  ],
  projectSponsors: [
    { sponsor: { id: "sponsor-1", name: "Sponsor 1" } },
    { sponsor: { id: "sponsor-2", name: "Sponsor 2" } },
  ],
  budgets: [{ __typename: "Budgets", id: "budget-1" }],
  projectLeads: [{ __typename: "ProjectLeads", userId: "user-1" }],
  pendingInvitations: [],
};

const projects3: GetAllFilterOptionsQuery["projects"][number] = {
  __typename: "Projects",
  id: "project-3",
  githubRepos: [
    {
      __typename: "ProjectGithubRepos",
      githubRepoId: 3,
      githubRepoDetails: {
        __typename: "GithubRepoDetails",
        id: 3,
        languages: { TypeScript: 1234 },
      },
    },
  ],
  projectSponsors: [],
  budgets: [{ __typename: "Budgets", id: "budget-1" }],
  projectLeads: [{ __typename: "ProjectLeads", userId: "user-1" }],
  pendingInvitations: [],
};

const projects4: GetAllFilterOptionsQuery["projects"][number] = {
  __typename: "Projects",
  id: "project-4",
  githubRepos: [
    {
      __typename: "ProjectGithubRepos",
      githubRepoId: 4,
      githubRepoDetails: {
        __typename: "GithubRepoDetails",

        id: 4,
        languages: { Go: 5555, C: 123 },
      },
    },
  ],
  projectSponsors: [],
  budgets: [{ __typename: "Budgets", id: "budget-1" }],
  projectLeads: [{ __typename: "ProjectLeads", userId: "user-1" }],
  pendingInvitations: [],
};

const projects5: GetAllFilterOptionsQuery["projects"][number] = {
  __typename: "Projects",
  id: "project-5",
  githubRepos: [
    {
      __typename: "ProjectGithubRepos",
      githubRepoId: 5,
      githubRepoDetails: {
        __typename: "GithubRepoDetails",

        id: 5,
        languages: { Elisp: 666 },
      },
    },
  ],
  budgets: [],
  projectSponsors: [{ sponsor: { id: "sponsor-3", name: "Sponsor 3" } }],
  projectLeads: [
    {
      __typename: "ProjectLeads",
      userId: "user-1",
    },
  ],
  pendingInvitations: [],
};

const graphQlMocks = [
  {
    request: {
      query: GET_ALL_FILTER_OPTIONS_QUERY,
    },
    result: {
      data: {
        projects: [projects1, projects2, projects3, projects4, projects5],
      },
    },
  },
];

const render = (isProjectLeader: boolean, { isCleared, mocks }: { isCleared?: boolean; mocks: MockedResponse[] }) =>
  renderWithIntl(
    <MockedProjectFilterProvider isCleared={isCleared}>
      <FilterPanel isProjectLeader={isProjectLeader} />
    </MockedProjectFilterProvider>,
    {
      wrapper: MemoryRouterProviderFactory({ mocks }),
    }
  );

describe("FilterPanel", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should display first 2 technologies of projects, all sponsors, and be sorted", async () => {
    render(false, { mocks: graphQlMocks });

    const allOptions = await screen.findAllByRole("option");
    expect(allOptions.length).toBe(8);
    expect(allOptions[0]).toHaveTextContent("C");
    expect(allOptions[1]).toHaveTextContent("C++");
    expect(allOptions[2]).toHaveTextContent("Go");
    expect(allOptions[3]).toHaveTextContent("Rust");
    expect(allOptions[4]).toHaveTextContent("Shell");
    expect(allOptions[5]).toHaveTextContent("TypeScript");
    expect(allOptions[6]).toHaveTextContent("Sponsor 1");
    expect(allOptions[7]).toHaveTextContent("Sponsor 2");
  });

  it("should display 'Mine only' when user is leader'", async () => {
    render(true, { mocks: graphQlMocks });

    await screen.findByText(/all projects/i);
    await screen.findByText(/mine only/i);
  });

  it("should not display technologies or sponsors from projects that aren't visible", async () => {
    render(true, { mocks: graphQlMocks });

    await screen.findByText(/go/i);
    expect(screen.queryByText(/elisp/i)).toBeNull();
    expect(screen.queryByText(/sponsor 3/i)).toBeNull();
  });

  test.each([true, false])("should not display clear all button if filter is cleared", async isProjectFilterCleared => {
    render(true, { isCleared: isProjectFilterCleared, mocks: graphQlMocks });

    if (isProjectFilterCleared) {
      expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument();
    } else {
      expect(screen.queryByText(/clear all/i)).toBeInTheDocument();
    }
  });
});

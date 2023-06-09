import React from "react";
import { shallow } from "enzyme";
import Logout from "./Logout";
import { render, fireEvent } from "@testing-library/react";

const logoutComponent = <Logout />;

const mockLogout = jest.fn();
jest.mock("../../hooks/authHooks", () => ({
  useUser: jest.fn(() => ({
    logout: mockLogout,
  })),
}));

describe("Logout Component", () => {
  it("should render correctly", () => {
    expect(shallow(logoutComponent).exists()).toBe(true);
  });
  it("triggers logout on click event", () => {
    const { getByTestId } = render(logoutComponent);
    fireEvent.click(getByTestId("logout"));
    expect(mockLogout).toBeCalled();
  });
});

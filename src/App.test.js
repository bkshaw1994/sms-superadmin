import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store/store";

test("renders login screen", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  const headingElement = screen.getByRole("heading", { name: /login/i });
  expect(headingElement).toBeInTheDocument();
});

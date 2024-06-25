// tests/test_multiply.mjs
import { multiply } from "../utils/multiply.js";
import { expect } from "chai";

describe("testing multiply", () => {
  it("should give 7*6 is 42", () => {
    expect(multiply(7, 6)).to.equal(42);
  });
});

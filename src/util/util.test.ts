import { EMAIL_REGEX } from "./util";

describe("email regex test", () => {
  test("good samples should match", () => {
    const validGoodEmailSamples = [
      "email@domain.com",
      "first.last@domain.com",
      "email@subdomain.name.com",
      "firstname+lastname@domain.com",
      "first.name+last.name@domain.com",
      "first-name+last-name@domain.com",
      "first.name+last-name@domain.com",
      "first-name+last.name@domain.com",
      "first-namelast.name@domain.com",
      "first.namelast-name@domain.com",
      "email@domain-one.com",
      "email@domain.name",
      "email@example.domain.name",
      "firstname-lastname@example.com",
      "1234567890@domain.com",
      "_______@example.com",
      "valid.name@aa.bb.cc.dd.ee.ff.gg.hh.jj.com",
      "a@bcd.ef",
    ];

    validGoodEmailSamples.forEach(sample => {
      expect(EMAIL_REGEX.test(sample)).toBeTruthy();
    });
  });

  test("bad samples should not match", () => {
    const validBadEmailSamples = [
      "email@123.123.123.123",
      "email@[123.123.123.123]",
      "much.“more unusual”@example.com",
      "very.unusual.“@”.unusual.com@example.com",
      'very.“(),:;<>[]”.VERY.“very@\\ "very”.unusual@strange.example.com',
      "“email”@example.com",
      "valid.name@aa.bb.cc.dd.ee.ff.gg.hh.jj.ii.com",
    ];

    validBadEmailSamples.forEach(sample => {
      expect(EMAIL_REGEX.test(sample)).toBeFalsy();
    });
  });

  test("invalid email samples should not match", () => {
    const invalidBadEmailSamples = [
      "plainaddress",
      "#@%^%#$@#$@#.com",
      "@example.com",
      "Joe Smith <email@example.com>",
      "email.example.com",
      "email@example@example.com",
      ".email@example.com",
      "email.@example.com",
      "email..email@example.com",
      "あいうえお@example.com",
      "email@example.com (Joe Smith)",
      "email@example",
      "email@-example.com",
      "email@111.222.333.44444",
      "email@example..com",
      "Abc..123@example.com",
      "“(),:;<>[]@example.com",
      'just"not"right@example.com',
      'this is"really"notallowed@example.com',
    ];

    invalidBadEmailSamples.forEach(sample => {
      expect(EMAIL_REGEX.test(sample)).toBeFalsy();
    });
  });
});

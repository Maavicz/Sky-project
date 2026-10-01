import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const phoneCountries = getCountries()
  .map((country) => ({
    country,
    name: regionNames.of(country) || country,
    callingCode: getCountryCallingCode(country),
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

export function normalizePhoneNumber(value, defaultCountry = "NG") {
  const parsed = parsePhoneNumberFromString(String(value ?? ""), defaultCountry);
  return parsed?.isValid() ? parsed.number : "";
}

export function isValidInternationalPhone(value) {
  return isValidPhoneNumber(String(value ?? ""));
}
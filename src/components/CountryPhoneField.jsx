import { useEffect, useRef, useState } from "react";
import { AsYouType, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";
import { phoneCountries } from "../testHelpers/phone.mjs";

function parseForCountry(value, country) {
  const input = String(value ?? "").trim();
  return input.startsWith("+")
    ? parsePhoneNumberFromString(input)
    : parsePhoneNumberFromString(input, country);
}

export default function CountryPhoneField({ id, label, value = "", onChange, defaultCountry = "NG", required = false, submitted = false, className = "" }) {
  const initialPhone = parsePhoneNumberFromString(value);
  const [country, setCountry] = useState(initialPhone?.country || defaultCountry);
  const [nationalNumber, setNationalNumber] = useState(initialPhone?.formatNational() || "");
  const lastPublishedValue = useRef(value);

  useEffect(() => {
    if (value === lastPublishedValue.current) return;
    lastPublishedValue.current = value;
    if (!value) {
      setNationalNumber("");
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (parsed) {
      setCountry(parsed.country || defaultCountry);
      setNationalNumber(parsed.formatNational());
    }
  }, [value, defaultCountry]);

  const valid = nationalNumber.length > 0 && isValidPhoneNumber(nationalNumber, country);
  const showRequiredError = required && submitted && !valid;
  const callingCode = getCountryCallingCode(country);

  const publishPhone = (input, selectedCountry = country) => {
    const parsed = parseForCountry(input, selectedCountry);
    if (parsed?.country && parsed.country !== selectedCountry) setCountry(parsed.country);
    const nextCountry = parsed?.country || selectedCountry;
    const isPhoneValid = parsed?.isValid() || false;
    lastPublishedValue.current = isPhoneValid ? parsed.number : "";
    onChange(isPhoneValid ? parsed.number : "");
    return { parsed, nextCountry };
  };

  const handlePhoneChange = (input) => {
    const { parsed, nextCountry } = publishPhone(input);
    setNationalNumber(parsed?.country ? parsed.formatNational() : new AsYouType(nextCountry).input(input));
  };

  const handleCountryChange = (event) => {
    const nextCountry = event.target.value;
    setCountry(nextCountry);
    if (!nationalNumber) {
      lastPublishedValue.current = "";
      onChange("");
      return;
    }
    const digits = nationalNumber.replace(/\D/g, "");
    const formatted = new AsYouType(nextCountry).input(digits);
    setNationalNumber(formatted);
    const parsed = parsePhoneNumberFromString(digits, nextCountry);
    const isPhoneValid = parsed?.isValid() || false;
    lastPublishedValue.current = isPhoneValid ? parsed.number : "";
    onChange(isPhoneValid ? parsed.number : "");
  };

  return (
    <div className={`block text-sm font-medium text-slate-700 ${className}`}>
      <label htmlFor={id} className="block">{label}</label>
      <div className={`mt-1 grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${showRequiredError || (nationalNumber.length > 0 && !valid) ? "border-rose-500 bg-rose-50 ring-2 ring-rose-200 focus-within:ring-rose-200" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-200"}`}>
        <select
          id={`${id}-country`}
          aria-label={`${label} country calling code`}
          value={country}
          onChange={handleCountryChange}
          className="min-h-12 min-w-0 border-0 border-r border-slate-200 bg-slate-50 px-2 text-sm text-slate-800 outline-none sm:px-3"
        >
          {phoneCountries.map((item) => (
            <option key={item.country} value={item.country}>{item.name} (+{item.callingCode})</option>
          ))}
        </select>
        <div className="relative min-w-0">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">+{callingCode}</span>
          <input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required={required}
            value={nationalNumber}
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder="Phone number"
            aria-invalid={showRequiredError || (nationalNumber.length > 0 && !valid)}
            aria-describedby={showRequiredError || (nationalNumber.length > 0 && !valid) ? `${id}-error` : undefined}
            className="min-h-12 w-full min-w-0 border-0 bg-transparent py-3 pl-12 pr-3 text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
      {(showRequiredError || (nationalNumber.length > 0 && !valid)) && <span id={`${id}-error`} className="mt-1 block text-xs font-medium text-rose-700">Enter a valid number for the selected country.</span>}
      {nationalNumber.length > 0 && valid && <span className="mt-1 block text-xs text-slate-500">Saved as {parseForCountry(nationalNumber, country)?.number}</span>}
    </div>
  );
}
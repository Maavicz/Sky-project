import { useState } from "react";
import Field from "./Field.jsx";

export default function LoginForm({ onSubmit, submitText }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="mt-6 space-y-4">
      <Field
        id="login-user"
        label="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <Field
        id="login-pass"
        label="Password"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        onClick={() => onSubmit({ user, pass })}
        className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
      >
        {submitText}
      </button>
    </div>
  );
}

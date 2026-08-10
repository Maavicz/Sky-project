export default function Field({ id, label, value, onChange, type = "text", placeholder = "", className = "", ...rest }) {
  return (
    <label htmlFor={id} className="block text-sm">
      <div className="font-medium">{label}</div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} mt-1 block w-full`}
        aria-label={label}
        {...rest}
      />
    </label>
  );
}

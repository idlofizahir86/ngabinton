import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Banyak form lama mereset state setelah aksi sukses lewat effect; aturan
      // baru di eslint-config-next 16 menandai pola itu sebagai error.
      "react-hooks/set-state-in-effect": "off",
      // Server Action `useActionState(prevState, formData)` sering tidak memakai
      // salah satu parameter → konvensi underscore diabaikan dari aturan unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;

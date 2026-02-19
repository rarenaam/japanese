import { UserNav } from "./auth/UserNav";

// Many generated apps (and LLMs) instinctively import `@/components/UserNav`.
// The template historically kept it under `components/auth/UserNav`, which can
// cause ENOENT build failures in the sandbox if the import path differs.
//
// This shim keeps both paths working and supports both named + default imports.
export { UserNav };
export default UserNav;


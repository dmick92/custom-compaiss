"use client";

import { useState } from "react";
import SignInForm from "~/app/_components/sign-in-form";
import SignUpForm from "~/app/_components/sign-up-form";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(false);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}

"use client";
import LoginButton from "./login/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="App">
        <LoginButton
          botUsername="tgdaddybot"
          onAuthCallback={(user) => {
            console.log(user);
          }}
          buttonSize="large"
          cornerRadius={5}
          showAvatar={true}
          lang="en"
        />
      </div>
    </main>
  );
}

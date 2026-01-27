<template>
  <div
    class="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-fade-in"
  >
    <div
      class="w-full max-w-sm sm:max-w-2xl bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6"
    >
      <header class="text-center space-y-2">
        <h1 class="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">Administrator Access</h1>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Only authorized campus administrators may sign in. Use your @carsu.edu.ph email address.
        </p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div class="space-y-3 sm:space-y-4">
          <div
            class="bg-gray-100/80 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-2"
          >
            <p class="font-semibold text-emerald-600 dark:text-emerald-300 text-sm">Manual Sign In</p>
            <p>
              Admin accounts are provisioned by the system team. Enter the email and password associated with
              your administrator profile.
            </p>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-xs sm:text-sm font-medium">Email</label>
            <input
              v-model="loginEmail"
              type="email"
              autocomplete="username"
              placeholder="admin.name@carsu.edu.ph"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none transition duration-300"
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-xs sm:text-sm font-medium">Password</label>
            <div class="relative">
              <input
                v-model="loginPassword"
                :type="showAdminLoginPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter password"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none transition duration-300 pr-10 sm:pr-12"
              />
              <button type="button" @click="showAdminLoginPassword = !showAdminLoginPassword" class="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-emerald-400 p-1">
                <svg v-if="showAdminLoginPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <button
            @click="handleManualLogin"
            class="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-800 transition duration-300"
          >
            Sign In Manually
          </button>
        </div>

        <div class="flex flex-col justify-between bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <p class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Sign in with Google</p>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use your university Google account. Access is granted only to emails that have administrator
              privileges assigned in the system.
            </p>
          </div>

          <div class="relative">
            <div id="googleButtonAdmin" class="w-full flex justify-center"></div>
          </div>

          <ul class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <li>• Successful login routes directly to the admin dashboard.</li>
            <li>• Contact the system maintainer if your account needs access.</li>
          </ul>
        </div>
      </section>

      <div class="space-y-2">
        <p v-if="errorMessage" class="text-xs sm:text-sm text-red-500 dark:text-red-400 text-center">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="text-xs sm:text-sm text-green-500 dark:text-green-400 text-center">
          {{ successMessage }}
        </p>
      </div>

      <div class="flex flex-col items-center space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <router-link to="/login" class="text-emerald-600 dark:text-emerald-400 hover:underline">
          Back to user & security sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
/* global google */
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const loginEmail = ref("");
const loginPassword = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const showAdminLoginPassword = ref(false);

let clientId = "";
let googleLoaded = false;
let googleInit = false;

const ADMIN_ROLE = "admin";

const handleManualLogin = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const email = loginEmail.value.trim().toLowerCase();
  if (!email.endsWith("@carsu.edu.ph")) {
    errorMessage.value = "Email must end with @carsu.edu.ph.";
    return;
  }
  if (!loginPassword.value) {
    errorMessage.value = "Password is required for manual admin login.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/simple-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: loginPassword.value, role: ADMIN_ROLE }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Manual login failed.";
      return;
    }

    if (!data.token || !data.user) {
      errorMessage.value = "Invalid response from server.";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    successMessage.value = "Login successful! Redirecting...";
    redirectToDashboard();
  } catch (err) {
    console.error("Admin manual login error:", err);
    errorMessage.value = "Unable to login right now.";
  }
};

const handleGoogleCredential = async (response) => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const res = await fetch("http://localhost:5000/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential, role: ADMIN_ROLE }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Google sign-in failed.";
      return;
    }

    if (!data.token || !data.user) {
      errorMessage.value = "Invalid response from server.";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    successMessage.value = "Login successful! Redirecting...";
    redirectToDashboard();
  } catch (err) {
    console.error("Admin Google login error:", err);
    errorMessage.value = "Sign-in failed. Please try again.";
  }
};

const redirectToDashboard = () => {
  setTimeout(() => {
    router.push("/admin-dashboard");
  }, 600);
};

const loadGoogleScript = () => {
  if (googleLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector("script[src='https://accounts.google.com/gsi/client']")) {
      googleLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const initializeGoogle = () => {
  if (!window.google || googleInit) return;
  google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential,
    ux_mode: "popup",
  });
  googleInit = true;
  renderGoogleButton();
};

const renderGoogleButton = () => {
  if (!window.google || !googleInit) return;
  const buttonContainer = document.getElementById("googleButtonAdmin");
  if (!buttonContainer) return;
  buttonContainer.innerHTML = "";
  google.accounts.id.renderButton(buttonContainer, {
    theme: "outline",
    size: "large",
    width: "280",
    text: "continue_with",
  });
};

const initGoogle = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google-client-id");
    const data = await res.json();
    clientId = data.clientId;
    await loadGoogleScript();
    initializeGoogle();
  } catch (err) {
    console.error("Failed to initialize Google Sign-In:", err);
    errorMessage.value = "Failed to load Google Sign-In.";
  }
};

onMounted(() => {
  initGoogle();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

import { createRouter, createWebHistory } from "vue-router";

import Landing from "@/views/LandingPage.vue";
import Login from "@/views/LoginPage.vue";
import AdminLogin from "@/views/AdminLogin.vue";
import Report from "@/views/ReportPage.vue";
import ReportFound from "@/views/ReportFound.vue";
import UserReportDetails from "@/views/UserReportDetails.vue";
import Search from "@/views/SearchPage.vue";
import Profile from "@/views/UserProfile.vue";
// import Notifications from "@/views/NotificationsPage.vue";
import Acknowledge from "@/views/Acknowledge.vue";
import UserClaimApproved from "@/views/UserClaimApproved.vue";
import UserClaimRejected from "@/views/UserClaimRejected.vue";
// import MatchItem from "@/views/MatchItem.vue";
import UserDashboard from "@/views/UserDashboard.vue";
import ItemMatchDetails from "@/views/match/ItemMatchDetails.vue";
import IDMatchDetails from "@/views/match/IDMatchDetails.vue";
import ClaimSubmitted from "@/views/ClaimSubmitted.vue";
import SecurityDashboard from "@/views/SecurityDashboard.vue";
import AdminDashboard from "@/views/AdminDashboard.vue"; // ✅ Import Admin Dashboard
import AuthCallback from "@/views/AuthCallback.vue"; // ✅ Added AuthCallback page
import ViewProfile from "@/views/ViewProfile.vue"; // <-- read-only profile page
import VerifyEmail from "@/views/VerifyEmail.vue";
import AboutUs from "@/views/AboutUs.vue";
import HowItWorks from "@/views/HowItWorks.vue";

const routes = [
  { path: "/", component: Landing, meta: { showThemeToggle: true } },
  { path: "/login", component: Login, meta: { showThemeToggle: true } },
  { path: "/admin-login", component: AdminLogin, meta: { showThemeToggle: false } },
  {
    path: "/register",
    redirect: { path: "/login", query: { tab: "register" } },
    meta: { showThemeToggle: true },
  },
  { path: "/report", component: Report, meta: { showThemeToggle: false } },
  { path: "/report-found", component: ReportFound, meta: { showThemeToggle: false } },
  { path: "/lost/:id", component: UserReportDetails, meta: { showThemeToggle: false } },
  { path: "/search", component: Search, meta: { showThemeToggle: false } },
  { path: "/profile/:id?", component: Profile, meta: { showThemeToggle: false } },
  // { path: "/notifications", component: Notifications, meta: { showThemeToggle: false } },
  { path: "/acknowledge", component: Acknowledge, meta: { showThemeToggle: false } },
  { path: "/claim-approved", name: "UserClaimApproved", component: UserClaimApproved, meta: { requiresAuth: true, allowedRoles: ["university_member"], showThemeToggle: false } },
  { path: "/claim-rejected", name: "UserClaimRejected", component: UserClaimRejected, meta: { requiresAuth: true, allowedRoles: ["university_member"], showThemeToggle: false } },
  
  {
    path: "/aboutus", 
    name: "AboutUs",
    component: AboutUs,
    meta: { showThemeToggle: true },
  },
  {
    path: "/how-it-works", 
    name: "HowItWorks",
    component: HowItWorks,
    meta: { showThemeToggle: true },
  },
  {
    path: "/userdashboard",
    name: "UserDashboard",
    component: UserDashboard,
    meta: { requiresAuth: true, allowedRoles: ["university_member"], showThemeToggle: false },
  },
  { path: "/item-match-details", name: "ItemMatchDetails", component: ItemMatchDetails, meta: { showThemeToggle: false } },
  { path: "/id-match-details/:id?", name: "IDMatchDetails", component: IDMatchDetails, meta: { showThemeToggle: false } },
  { path: "/claim-submitted", name: "ClaimSubmitted", component: ClaimSubmitted, meta: { showThemeToggle: false } },
  {
    path: "/security-dashboard",
    name: "SecurityDashboard",
    component: SecurityDashboard,
    meta: { requiresAuth: true, allowedRoles: ["security"], showThemeToggle: false },
  },
  {
    path: "/admin-dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin"],
      redirectIfUnauthenticated: "/admin-login",
      showThemeToggle: false,
    },
  }, // ✅ Admin route
  { path: "/auth/callback", name: "AuthCallback", component: AuthCallback, meta: { showThemeToggle: false } }, // ✅ OAuth redirect
  { path: "/verify-email", name: "VerifyEmail", component: VerifyEmail, meta: { showThemeToggle: false } },
  {
    path: "/view-profile/:id?",
    name: "ViewProfile",
    component: ViewProfile,
    meta: { requiresAuth: true, showThemeToggle: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard with profile completeness check
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      user = null;
    }
  }

  if (to.meta?.requiresAuth) {
    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const redirectTarget = to.meta.redirectIfUnauthenticated || "/login";
      return next(redirectTarget);
    }

    if (
      to.meta.allowedRoles &&
      user?.role &&
      !to.meta.allowedRoles.includes(user.role)
    ) {
      if (user.role === "admin") return next("/admin-dashboard");
      if (user.role === "security") return next("/security-dashboard");
      if (user.role === "university_member") return next("/userdashboard");
      return next("/login");
    }
  }

  // NOTE: Profile completeness should only be enforced after a successful sign-in.
  // The post-login flow in LoginPage handles redirecting incomplete university_member
  // users to /profile?next=.... We avoid checking profile here to prevent
  // redirecting users who merely click the sign-in link.

  // Require login redirection shortcuts
  if (to.path === "/login" && token) {
    if (user?.role === "university_member") return next("/userdashboard");
    if (user?.role === "security") return next("/security-dashboard");
    if (user?.role === "admin") return next("/admin-dashboard");
    return next();
  }

  if (to.path === "/admin-login" && token) {
    if (user?.role === "admin") return next("/admin-dashboard");
    if (user?.role === "security") return next("/security-dashboard");
    if (user?.role === "university_member") return next("/userdashboard");
    return next();
  }

  next();
});

export default router;
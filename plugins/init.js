import * as jwt from "jsonwebtoken";

const unprotectedPaths = ["/login"];

const adminOnlyPaths = [
  "/admin", // match any admin route
];

export default function (context) {
  window.onNuxtReady(async () => {
    await checkAuth(context);
  });
}

export async function checkAuth(context) {
  if (
    !unprotectedPaths.find((path) =>
      decodeURI(context.route.path).startsWith(path)
    )
  ) {
    if (localStorage.getItem("jwt")) {
      const decoded = jwt.decode(localStorage.getItem("jwt"), {
        complete: false,
      });
      if (
        adminOnlyPaths.find((path) =>
          decodeURI(context.route.path).startsWith(path)
        ) &&
        decoded.role !== "ADMIN"
      ) {
        await window.$nuxt.$router.push("/");
      }
    } else {
      await window.$nuxt.$router.push("/login");
    }
  }
}

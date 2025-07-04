export default defineNuxtPlugin(() => {
  // Initialize stores on client-side
  const userInfoStore = useUserInfoStore()
  const fireLevelStore = useFireLevelStore()
  const chatSessionStore = useChatSessionStore()

  // Load user info from localStorage if available
  if (process.client) {
    userInfoStore.loadUserInfo()
  }
})
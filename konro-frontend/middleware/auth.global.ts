export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for demo and index pages
  if (to.path === '/' || to.path === '/demo') {
    return
  }

  const userInfoStore = useUserInfoStore()
  const chatSessionStore = useChatSessionStore()

  // Route protection logic
  switch (to.path) {
    case '/setup':
      // Setup page is always accessible
      break

    case '/select':
      // Fire level selection is accessible after setup (or skip)
      break

    case '/chat':
      // Chat requires active session
      if (!chatSessionStore.hasActiveSession) {
        return navigateTo('/select')
      }
      break

    case '/goodbye':
      // Goodbye page requires recent session end or active session
      if (!chatSessionStore.recentlyEnded && !chatSessionStore.hasActiveSession) {
        return navigateTo('/select')
      }
      break
  }
})
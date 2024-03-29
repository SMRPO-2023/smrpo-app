const requestInterceptor = app => {
  app.$axios.interceptors.request.use(
    config => {
      if (localStorage.getItem('jwt')) {
        config.headers.Authorization =  `Bearer ${localStorage.getItem('jwt')}`;
      }
      return config;
    },
    err => {
      return Promise.reject(err)
    }
  )
}

const responseInterceptor = app => {
  app.$axios.interceptors.response.use(
    config => config,
    async error => {
      console.error("API Response Error:", error)
      if (error.response.status === 401) {
        localStorage.removeItem('jwt')
        await app.store.dispatch('user/unsetUser')
        await app.router.push('/login')
        return
      }

      return Promise.reject(error)
    }
  )
}

export default ({ app }) => {
  requestInterceptor(app)
  responseInterceptor(app)
}

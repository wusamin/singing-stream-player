export const useSingingList = () => {
  const { data } = useFetch('/api/singing/list', {
    default: () => [],
  })

  return {
    list: data,
  }
}

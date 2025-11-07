export const useModal = () => {
  const visible = ref<boolean>(false)

  const show = () => {
    visible.value = true
  }

  const dismiss = () => {
    visible.value = false
  }

  return {
    visible,
    show,
    dismiss,
  }
}

const useUtils = () => {
  const getRandom = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  return {
    getRandom
  }
}

export default useUtils

/** Linear equivalent of /^.*\/(.+)\.vue$/ replacement, including unmatched inputs. */
export const componentName = (filename: string) => {
  if (/[\r\n\u2028\u2029]/.test(filename) || !filename.endsWith('.vue')) return filename
  const stemEnd = filename.length - 4
  const slash = filename.lastIndexOf('/', stemEnd - 2)
  if (slash < 0 || stemEnd - slash <= 1) return filename
  return filename.slice(slash + 1, stemEnd)
}

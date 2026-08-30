export function slugify(input) {
  if (input == null) {
    return '';
  }

  let result = input.toString().normalize('NFKD');
  result = result.replace(/\p{M}+/gu, '');
  result = result.toLowerCase();
  result = result.replace(/&/g, ' and ');
  result = result.replace(/[^a-z0-9]+/g, '-');
  result = result.replace(/^-|-$/g, '');
  return result;
}
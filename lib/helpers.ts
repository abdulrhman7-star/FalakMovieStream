// lib/helpers.ts
export function escapeHtml(str: string | null | undefined): string {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

export function slugify(text: string | undefined | null): string {
    if (!text) return '';
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A\-]+/g, '')
      .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

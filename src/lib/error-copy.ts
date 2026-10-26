import { defaultLocale, isLocale, type Locale } from "@/lib/site";

/**
 * Copy for the error boundaries. Kept in its own small module (plain data, no
 * server-only imports) so the client error component can pull it without
 * dragging the full page-content graph into the client bundle.
 */
type ErrorCopy = {
  title: string;
  body: string;
  retry: string;
  home: string;
};

const errorCopy: Record<Locale, ErrorCopy> = {
  tr: {
    title: "Bir şeyler ters gitti",
    body: "Beklenmedik bir hata oluştu. Sayfayı yeniden deneyebilir ya da ana sayfaya dönebilirsiniz.",
    retry: "Tekrar dene",
    home: "Ana sayfa",
  },
  en: {
    title: "Something went wrong",
    body: "An unexpected error occurred. You can try again or go back to the home page.",
    retry: "Try again",
    home: "Home",
  },
  es: {
    title: "Algo salió mal",
    body: "Ocurrió un error inesperado. Puedes reintentar o volver al inicio.",
    retry: "Reintentar",
    home: "Inicio",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "Si è verificato un errore imprevisto. Puoi riprovare o tornare alla home.",
    retry: "Riprova",
    home: "Home",
  },
  id: {
    title: "Ada yang tidak beres",
    body: "Terjadi kesalahan tak terduga. Anda bisa coba lagi atau kembali ke beranda.",
    retry: "Coba lagi",
    home: "Beranda",
  },
  pt: {
    title: "Algo deu errado",
    body: "Ocorreu um erro inesperado. Você pode tentar de novo ou voltar ao início.",
    retry: "Tentar de novo",
    home: "Início",
  },
};

export function getErrorCopy(locale: string): ErrorCopy {
  return errorCopy[isLocale(locale) ? locale : defaultLocale];
}

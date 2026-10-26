import { JsonFormScript } from "@/components/json-form-script";
import { Button } from "@/components/ui/button";
import {
  ConsentCheckbox,
  Field,
  FormStatus,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui/field";
import type { Locale } from "@/lib/site";
import { withBasePath } from "@/lib/base-path";

type PilotProgramFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    buildingLabel: "Building type",
    buttonLabel: "Apply for pilot",
    consentLabel: "I agree to be contacted about a SismoSmart pilot and understand this is not an emergency service.",
    countryLabel: "Country",
    emailLabel: "Work email",
    errorMessage: "We could not send the application. Please try again.",
    interestLabel: "Interest type",
    loadingLabel: "Sending...",
    messageLabel: "Building notes",
    missingEndpointMessage: "The form is not connected yet. Please contact SismoSmart directly.",
    rateLimitedMessage: "Too many attempts. Please try again in a few minutes.",
    nameLabel: "Full name",
    numberLabel: "Number of buildings",
    organizationLabel: "Organization",
    roleLabel: "Role",
    successMessage: "Application received. We will review it and write back.",
  },
  tr: {
    buildingLabel: "Bina tipi",
    buttonLabel: "Pilot için başvur",
    consentLabel: "SismoSmart pilotu hakkında iletişime geçilmesini kabul ediyorum ve bunun acil durum servisi olmadığını anlıyorum.",
    countryLabel: "Ülke",
    emailLabel: "İş e-postası",
    errorMessage: "Başvuru gönderilemedi. Lütfen tekrar deneyin.",
    interestLabel: "İlgi alanı",
    loadingLabel: "Gönderiliyor...",
    messageLabel: "Bina notu",
    missingEndpointMessage: "Form henüz bağlı değil. Lütfen SismoSmart ile doğrudan iletişime geçin.",
    rateLimitedMessage: "Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.",
    nameLabel: "Ad soyad",
    numberLabel: "Bina sayısı",
    organizationLabel: "Kurum",
    roleLabel: "Rol",
    successMessage: "Başvuru alındı. İnceleyip size döneceğiz.",
  },
  es: {
    buildingLabel: "Tipo de edificio",
    buttonLabel: "Postular al piloto",
    consentLabel: "Acepto que SismoSmart me contacte sobre pilotos y entiendo que no es un servicio de emergencia.",
    countryLabel: "País",
    emailLabel: "Email de trabajo",
    errorMessage: "No pudimos enviar la solicitud. Inténtalo de nuevo.",
    interestLabel: "Tipo de interés",
    loadingLabel: "Enviando...",
    messageLabel: "Notas del edificio",
    missingEndpointMessage: "El formulario aún no está conectado. Contacta directamente con SismoSmart.",
    rateLimitedMessage: "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
    nameLabel: "Nombre completo",
    numberLabel: "Número de edificios",
    organizationLabel: "Organización",
    roleLabel: "Rol",
    successMessage: "Solicitud recibida. La revisaremos y responderemos.",
  },
  id: {
    buildingLabel: "Tipe bangunan",
    buttonLabel: "Ajukan pilot",
    consentLabel: "Saya setuju dihubungi tentang pilot SismoSmart dan memahami ini bukan layanan darurat.",
    countryLabel: "Negara",
    emailLabel: "Email kerja",
    errorMessage: "Aplikasi belum terkirim. Coba lagi.",
    interestLabel: "Jenis minat",
    loadingLabel: "Mengirim...",
    messageLabel: "Catatan bangunan",
    missingEndpointMessage: "Form belum terhubung. Hubungi SismoSmart secara langsung.",
    rateLimitedMessage: "Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.",
    nameLabel: "Nama lengkap",
    numberLabel: "Jumlah bangunan",
    organizationLabel: "Organisasi",
    roleLabel: "Peran",
    successMessage: "Aplikasi diterima. Kami akan meninjau dan membalas.",
  },
  pt: {
    buildingLabel: "Tipo de edifício",
    buttonLabel: "Candidatar-se ao piloto",
    consentLabel: "Aceito ser contatado sobre pilotos SismoSmart e entendo que isto não é um serviço de emergência.",
    countryLabel: "País",
    emailLabel: "Email de trabalho",
    errorMessage: "Não foi possível enviar a candidatura. Tente novamente.",
    interestLabel: "Tipo de interesse",
    loadingLabel: "Enviando...",
    messageLabel: "Notas do prédio",
    missingEndpointMessage: "O formulário ainda não está conectado. Contate a SismoSmart diretamente.",
    rateLimitedMessage: "Tentativas demais. Tente de novo daqui a alguns minutos.",
    nameLabel: "Nome completo",
    numberLabel: "Número de edifícios",
    organizationLabel: "Organização",
    roleLabel: "Função",
    successMessage: "Candidatura recebida. Vamos analisar e responder.",
  },
  it: {
    buildingLabel: "Tipo di edificio",
    buttonLabel: "Candidati al pilota",
    consentLabel: "Accetto di essere contattato sul pilota SismoSmart e comprendo che non è un servizio di emergenza.",
    countryLabel: "Paese",
    emailLabel: "Email di lavoro",
    errorMessage: "Non siamo riusciti a inviare la richiesta. Riprova.",
    interestLabel: "Tipo di interesse",
    loadingLabel: "Invio...",
    messageLabel: "Note sull'edificio",
    missingEndpointMessage: "Il modulo non è ancora collegato. Contatta direttamente SismoSmart.",
    rateLimitedMessage: "Troppi tentativi. Riprova tra qualche minuto.",
    nameLabel: "Nome completo",
    numberLabel: "Numero di edifici",
    organizationLabel: "Organizzazione",
    roleLabel: "Ruolo",
    successMessage: "Richiesta ricevuta. La esamineremo e risponderemo.",
  },
} satisfies Record<Locale, Record<string, string>>;

type SelectOption = {
  label: string;
  value: string;
};

const interestOptions = {
  en: [
    { label: "Residential buildings", value: "residential-buildings" },
    { label: "Campuses", value: "campuses" },
    { label: "Industrial sites", value: "industrial-sites" },
    { label: "Municipal pilots", value: "municipal-pilots" },
    { label: "Research partners", value: "research-partners" },
    { label: "Insurance/risk partners", value: "insurance-risk-partners" },
  ],
  tr: [
    { label: "Konut binaları", value: "residential-buildings" },
    { label: "Kampüsler", value: "campuses" },
    { label: "Fabrikalar ve tesisler", value: "industrial-sites" },
    { label: "Belediye pilotları", value: "municipal-pilots" },
    { label: "Araştırma ortakları", value: "research-partners" },
    { label: "Sigorta/risk ortakları", value: "insurance-risk-partners" },
  ],
  es: [
    { label: "Edificios residenciales", value: "residential-buildings" },
    { label: "Campus", value: "campuses" },
    { label: "Sitios industriales", value: "industrial-sites" },
    { label: "Pilotos municipales", value: "municipal-pilots" },
    { label: "Socios de investigación", value: "research-partners" },
    { label: "Socios de seguros/riesgo", value: "insurance-risk-partners" },
  ],
  id: [
    { label: "Bangunan hunian", value: "residential-buildings" },
    { label: "Kampus", value: "campuses" },
    { label: "Lokasi industri", value: "industrial-sites" },
    { label: "Pilot pemerintah kota", value: "municipal-pilots" },
    { label: "Mitra riset", value: "research-partners" },
    { label: "Mitra asuransi/risiko", value: "insurance-risk-partners" },
  ],
  pt: [
    { label: "Edifícios residenciais", value: "residential-buildings" },
    { label: "Campi", value: "campuses" },
    { label: "Instalações industriais", value: "industrial-sites" },
    { label: "Pilotos municipais", value: "municipal-pilots" },
    { label: "Parceiros de pesquisa", value: "research-partners" },
    { label: "Parceiros de seguros/risco", value: "insurance-risk-partners" },
  ],
  it: [
    { label: "Edifici residenziali", value: "residential-buildings" },
    { label: "Campus", value: "campuses" },
    { label: "Siti industriali", value: "industrial-sites" },
    { label: "Pilot municipali", value: "municipal-pilots" },
    { label: "Partner di ricerca", value: "research-partners" },
    { label: "Partner assicurativi/rischio", value: "insurance-risk-partners" },
  ],
} satisfies Record<Locale, SelectOption[]>;

const buildingOptions = {
  en: [
    { label: "Apartment / residential", value: "apartment-residential" },
    { label: "Campus", value: "campus" },
    { label: "Industrial facility", value: "industrial-facility" },
    { label: "Municipal building", value: "municipal-building" },
    { label: "Research site", value: "research-site" },
    { label: "Other", value: "other" },
  ],
  tr: [
    { label: "Apartman / konut", value: "apartment-residential" },
    { label: "Kampüs", value: "campus" },
    { label: "Fabrika / tesis", value: "industrial-facility" },
    { label: "Belediye binası", value: "municipal-building" },
    { label: "Araştırma sahası", value: "research-site" },
    { label: "Diğer", value: "other" },
  ],
  es: [
    { label: "Apartamento / residencial", value: "apartment-residential" },
    { label: "Campus", value: "campus" },
    { label: "Instalación industrial", value: "industrial-facility" },
    { label: "Edificio municipal", value: "municipal-building" },
    { label: "Sitio de investigación", value: "research-site" },
    { label: "Otro", value: "other" },
  ],
  id: [
    { label: "Apartemen / hunian", value: "apartment-residential" },
    { label: "Kampus", value: "campus" },
    { label: "Fasilitas industri", value: "industrial-facility" },
    { label: "Gedung pemerintah kota", value: "municipal-building" },
    { label: "Lokasi riset", value: "research-site" },
    { label: "Lainnya", value: "other" },
  ],
  pt: [
    { label: "Apartamento / residencial", value: "apartment-residential" },
    { label: "Campus", value: "campus" },
    { label: "Instalação industrial", value: "industrial-facility" },
    { label: "Edifício municipal", value: "municipal-building" },
    { label: "Local de pesquisa", value: "research-site" },
    { label: "Outro", value: "other" },
  ],
  it: [
    { label: "Appartamento / residenziale", value: "apartment-residential" },
    { label: "Campus", value: "campus" },
    { label: "Struttura industriale", value: "industrial-facility" },
    { label: "Edificio municipale", value: "municipal-building" },
    { label: "Sito di ricerca", value: "research-site" },
    { label: "Altro", value: "other" },
  ],
} satisfies Record<Locale, SelectOption[]>;

export function PilotProgramForm({ locale }: PilotProgramFormProps) {
  const labels = copy[locale];

  return (
    <>
      <form
        className="space-y-5"
        data-analytics-form="pilot_program"
        data-endpoint={withBasePath("/api/waitlist")}
        data-error={labels.errorMessage}
        data-json-form=""
        data-loading={labels.loadingLabel}
        data-missing-endpoint={labels.missingEndpointMessage}
        data-rate-limited={labels.rateLimitedMessage}
        data-success={labels.successMessage}
      >
        <input name="locale" type="hidden" value={locale} />
        <input name="source" type="hidden" value="pilot-program" />
        <label className="sr-only" aria-hidden="true">
          Website
          <input
            autoComplete="off"
            className="hidden"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={labels.nameLabel} name="name" autoComplete="name" required />
          <TextField label={labels.emailLabel} name="email" autoComplete="email" required type="email" />
          <TextField label={labels.organizationLabel} name="organization" autoComplete="organization" required />
          <TextField label={labels.countryLabel} name="country" autoComplete="country-name" required />
          <TextField label={labels.roleLabel} name="role" autoComplete="organization-title" required />
          <TextField label={labels.numberLabel} name="number_of_buildings" min={1} required type="number" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={labels.interestLabel} name="interest_type" options={interestOptions[locale]} />
          <SelectField label={labels.buildingLabel} name="building_type" options={buildingOptions[locale]} />
        </div>

        <Field label={labels.messageLabel}>
          <TextArea name="message" required />
        </Field>

        <ConsentCheckbox label={labels.consentLabel} />

        <FormStatus />

        <Button
          className="w-full sm:w-auto"
          data-idle-label={labels.buttonLabel}
          type="submit"
        >
          {labels.buttonLabel}
        </Button>
      </form>
      <JsonFormScript />
    </>
  );
}

type TextFieldProps = {
  autoComplete?: string;
  label: string;
  min?: number;
  name: string;
  required?: boolean;
  type?: "email" | "number" | "text";
};

function TextField({
  autoComplete,
  label,
  min,
  name,
  required,
  type = "text",
}: TextFieldProps) {
  return (
    <Field label={label}>
      <TextInput
        autoComplete={autoComplete}
        min={min}
        name={name}
        required={required}
        type={type}
      />
    </Field>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: SelectOption[];
}) {
  return (
    <Field label={label}>
      <Select name={name} required>
        <option value="">-</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

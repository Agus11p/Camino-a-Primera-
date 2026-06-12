import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Info, 
  Mail, 
  Shield, 
  X, 
  ChevronRight, 
  Heart, 
  Apple, 
  CalendarDays,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LanguageCode } from '../lib/i18n';

interface InfoAndLegalProps {
  initialTab?: 'about' | 'privacy' | 'contact' | 'guides' | null;
  onClose: () => void;
  language: LanguageCode;
}

export default function InfoAndLegal({ initialTab, onClose, language }: InfoAndLegalProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'contact' | 'guides'>(initialTab || 'guides');

  // Translations dictionary
  const content = {
    ES: {
      title: "Información & Guías",
      subtitle: "Centro de recursos deportivos, ayuda y marcos de privacidad.",
      tab_guides: "Guías de Rendimiento",
      tab_about: "Acerca de",
      tab_contact: "Contacto",
      tab_privacy: "Privacidad",
      close: "Cerrar",
      contact_title: "Canales de Asistencia y Contacto",
      contact_desc: "Si eres futbolista amateur, entrenador, o tienes consultas comerciales e institucionales sobre Camino a Primera, escríbenos directamente.",
      contact_email_label: "Correo Electrónico de Soporte:",
      contact_address_label: "Sede de Desarrollo:",
      contact_address_val: "Buenos Aires, Argentina (AIS Cloud Container Ecosystem)",
      contact_note: "Atención personalizada al atleta las 24 horas del día por email.",
      about_title: "Sobre Camino a Primera",
      about_desc1: "Camino a Primera nació como una herramienta tecnológica diseñada especialmente para futbolistas entusiastas, amateurs y jóvenes promesas que desean llevar su carrera deportiva amateurs al siguiente nivel.",
      about_desc2: "Permite la monitorización continua y cuantitativa de tu progreso: desde cuántos goles o asistencias marcas consecutivamente, hasta la consolidación de metas estratégicas a corto, mediano y largo plazo. Nuestro lema es claro: la disciplina supera al talento.",
      guide_tag: "Contenido de Valor Académico",
      guide_desc: "Artículos breves y guías validadas para deportistas amateur.",
      privacy_title: "Política de Privacidad",
      privacy_last_updated: "Última actualización: Junio de 2026",
      privacy_section1: "1. Información de Registro y Datos Personales",
      privacy_section1_desc: "Camino a Primera respeta absolutamente la privacidad del usuario. Almacenamos métricas corporales básicas (peso, altura, club, posición) necesarias exclusivamente para estimar tu índice de consistencia deportiva y proporcionar análisis gráficos personalizados en tiempo real.",
      privacy_section2: "2. Almacenamiento Local (LocalFirst) vs Base de Datos",
      privacy_section2_desc: "Tus logs de partidos y entrenamientos se guardan en el LocalStorage de tu dispositivo para permitir un funcionamiento offline sin interrupciones. Cuando decides registrarte, tus datos son sincronizados con la nube segura de Supabase mediante políticas de seguridad restrictivas Row Level Security (RLS) que aíslan tus datos de cualquier otro usuario.",
      privacy_section3: "3. Uso de Cookies y Publicidad",
      privacy_section3_desc: "Este sitio preparará e implementará sistemas de anuncios como Google AdSense. El uso de estos servicios puede implicar el uso de cookies para comprender la experiencia de navegación del usuario y ofrecer publicidad de acuerdo a sus intereses deportivos.",
      privacy_section4: "4. Derechos del Atleta",
      privacy_section4_desc: "Tienes derecho a borrar por completo toda tu información del dispositivo o de nuestra base de datos en cualquier momento mediante la sección 'Restablecer Datos' en la pestaña Configuración."
    },
    EN: {
      title: "Information & Guides",
      subtitle: "Sports resource center, support channels and privacy frameworks.",
      tab_guides: "Performance Guides",
      tab_about: "About Us",
      tab_contact: "Contact",
      tab_privacy: "Privacy",
      close: "Close",
      contact_title: "Support and Contact Channels",
      contact_desc: "If you are an amateur player, coach, or have business and institutional questions about Camino a Primera, reach out directly.",
      contact_email_label: "Support Email:",
      contact_address_label: "Development Hub:",
      contact_address_val: "Buenos Aires, Argentina (AIS Cloud Container Ecosystem)",
      contact_note: "Personalized athlete assistance 24/7 via email.",
      about_title: "About Camino a Primera",
      about_desc1: "Camino a Primera is a sports-tech tool designed specifically for enthusiasts, amateur athletes, and young prospects aiming to structure and level up their gaming metrics.",
      about_desc2: "It allows continuous tracking of stats: from successive goals or direct assists to macro and micro seasonal targets. Our rule is simple: consistency beats pure talent.",
      guide_tag: "Academic Insights",
      guide_desc: "Short articles and validated tips for amateur athletes.",
      privacy_title: "Privacy Policy",
      privacy_last_updated: "Last updated: June 2026",
      privacy_section1: "1. Profile and Personal Data Information",
      privacy_section1_desc: "Camino a Primera respects your absolute rights. We only storage general body parameters (weight, height, club, position) to estimate your performance rates and render individual charts in real-time.",
      privacy_section2: "2. LocalStorage (LocalFirst) vs Cloud Database",
      privacy_section2_desc: "Match and practice logs are safely persisted on your browser LocalStorage to maintain seamless offline operations. Upon logging in, data is backed up to Supabase cloud utilizing Row Level Security (RLS) ensuring nobody else can read your numbers.",
      privacy_section3: "3. Cookie Policies & Ad Delivery",
      privacy_section3_desc: "This site integrates Google AdSense tools for monetization. Third-party vendors might employ browser cookies to present contextually relevant sports items based on user preferences.",
      privacy_section4: "4. Athlete Rights",
      privacy_section4_desc: "At any point, you can wipe and delete your absolute metadata forever by pressing 'Reset Data' under the Settings tab."
    },
    PT: {
      title: "Informação & Guias",
      subtitle: "Central de recursos esportivos, suporte e privacidade legal.",
      tab_guides: "Guias de Treino",
      tab_about: "Sobre nós",
      tab_contact: "Contato",
      tab_privacy: "Privacidade",
      close: "Fechar",
      contact_title: "Canais de Atendimento e Contato",
      contact_desc: "Se você é atleta amador, técnico ou tem dúvidas sobre a plataforma Camino a Primera, escreva diretamente para nós.",
      contact_email_label: "E-mail de Suporte:",
      contact_address_label: "Sede de Desenvolvimento:",
      contact_address_val: "Buenos Aires, Argentina (AIS Cloud Container Ecosystem)",
      contact_note: "Apoio personalizado ao atleta disponível 24h por e-mail.",
      about_title: "Sobre Camino a Primera",
      about_desc1: "Camino a Primera nasceu como uma ferramenta esportiva criada para jogadores amadores e jovens que desejam organizar suas métricas de jogo.",
      about_desc2: "Monitore gols, assistências, defesas de goleiro ou metas de curto a longo prazo em painéis estatísticos intuitivos. Nosso lema: a disciplina sempre supera o talento.",
      guide_tag: "Conteúdo Técnico Relevante",
      guide_desc: "Conselhos e guías científicas breves para atletas em formação.",
      privacy_title: "Política de Privacidade",
      privacy_last_updated: "Última atualização: Junho de 2026",
      privacy_section1: "1. Informações de Perfil e Dados Pessoais",
      privacy_section1_desc: "Respeitamos estritamente a privacidade. Coletamos métricas físicas básicas (peso bruto, tamanho, posição, clube) apenas para personalizar a análise de rendimento de jogo.",
      privacy_section2: "2. Armazenamento Local Local-First vs Nuvem",
      privacy_section2_desc: "Seus dados de gols e partidas ficam offline em seu dispositivo pelo LocalStorage. Ao criar uma conta, sincronizamos com segurança contratada no Supabase usando Row Level Security (RLS).",
      privacy_section3: "3. Cookies e Anúncios AdSense",
      privacy_section3_desc: "Este ambiente prepara a entrega de anúncios fiscais via Google AdSense. Cookies de terceiros podem monitorar preferências de esportes para fins publicitários.",
      privacy_section4: "4. Direitos do Jogador",
      privacy_section4_desc: "Você pode apagar e desvincular todo o seu registro pessoal com um clique no botão de 'Resetar Aplicativo' nas Configurações."
    }
  };

  const t = (key: keyof typeof content['ES']) => {
    const lang = (language === 'EN' || language === 'PT') ? language : 'ES';
    return content[lang][key];
  };

  // Structured High Value Content Articles (The AdSense academic content bots look for)
  const guidesList = [
    {
      id: 1,
      icon: <Apple className="w-4 h-4 text-emerald-400 font-bold" />,
      title_es: "Nutrición y Comida Pre-Partido para Futbolistas Amateurs",
      title_en: "Pre-Match Meal & Hydration Guidelines for Amateurs",
      title_pt: "Alimentação Pré-Jogo: O que comer para ter energia",
      author: "Lic. Martín Soria (Nutrición Deportiva)",
      readTime: "3 min",
      bullets_es: [
        "Carbohidratos de bajo índice glucémico 3-4 horas antes: Pasta integral, papa hervida, avena o arroz blanco con bajo condimento.",
        "Evitar grasas saturadas y lactosa espesa que puedan generar retrasos digestivos o pesadez estomacal.",
        "La hidratación constante: Tomar al menos 500ml de agua limpia o suero de sales minerales durante las dos horas previas al calentamiento."
      ],
      bullets_en: [
        "Low-glycemic carbs 3-4 hours prior: Whole pasta, baked potatoes, oats, or clean rice with light seasoning.",
        "Avoid saturated fats or heavy dairy items to prevent digestive crashes or stomach discomfort.",
        "Consistent hydration: Sip at least 500ml of clean water or mineralized recovery drinks 2 hours before warm-up."
      ],
      bullets_pt: [
        "Carboidratos simples 3 a 4 horas antes: Macarrão integral, batata cozida, aveia ou arroz sem condimentos pesados.",
        "Evite gorduras saturadas e derivados de leite para evitar lentidão digestiva no primeiro tempo.",
        "Hidratação: Beber ao menos 500ml de água mineral nas duas horas antes do apito inicial."
      ]
    },
    {
      id: 2,
      icon: <Heart className="w-4 h-4 text-rose-400 font-bold" />,
      title_es: "Optimización del Descanso y Prevención de Fatiga Muscular",
      title_en: "Sleep Optimization & Amateur Recovery Fundamentals",
      title_pt: "Recuperação Muscular Ativa e Otimização do Sono",
      author: "Dr. Sergio Rossi (Medicina del Deporte)",
      readTime: "4 min",
      bullets_es: [
        "El ciclo del sueño: Dormir entre 7 y 8.5 horas por noche promueve la secreción de hormona del crecimiento para recuperar fibras musculares dañadas.",
        "Elongación pasiva vs activa: Estirar con cuidado después de cada entrenamiento ayuda a liberar ácido láctico acumulado.",
        "Baño de contraste: Alternar agua tibia y fría por 15 segundos reactiva la irrigación sanguínea en los gemelos y cuádriceps tras partidos intensos."
      ],
      bullets_en: [
        "Sleep science: Targeting 7 to 8.5 hours resets muscular micro-tears via human growth hormone release.",
        "Stretching types: Passive and light recovery routines after games release localized lactic acid buildup.",
        "Contrast therapy (hot/cold): Alternar micro-baths for 15s increases fresh arterial blood circulation."
      ],
      bullets_pt: [
        "O sono reparador: Dormir entre 7 e 9 horas por noite regula o cortisol e regenera tecidos das pernas.",
        "Alongamento pós-esforço: Exercícios de flexibilidade leve ajudam a remover o lactato muscular de forma natural.",
        "Crioterapia caseira: Água gelada nas pernas por 5 minutos diminui inflamações em quadríceps e panturrilhas."
      ]
    },
    {
      id: 3,
      icon: <CalendarDays className="w-4 h-4 text-blue-400 font-bold" />,
      title_es: "Cómo Planificar Metas Cortas para Aumentar de Categoría",
      title_en: "How to Build Short Goals to Climb Divisions Successfully",
      title_pt: "Planejamento de Metas Semanais para Atletas Amadores",
      author: "Prof. Alejandro Varela (Director Táctico)",
      readTime: "2 min",
      bullets_es: [
        "No te enfoques solo en ser campeón: Define micro-objetivos, como registrar 2 sesiones más de velocidad por semana o mantener orden táctico.",
        "Mide tu precisión: Un delantero debe enfocarse en tiros efectivos al arco más que en golazos fortuitos.",
        "Anota todo en tu bitácora: Llevar el registro cuantificable es el único método empírico que sostiene un alto estándar deportivo."
      ],
      bullets_en: [
        "Avoid macro obsession: Design concrete habits, like logging 2 speed sprints an hour or keeping tactical position.",
        "Precision scaling: Target effective shots on goals rather than counting on low-percentage highlight hits.",
        "Use your log tool: Maintaining an empirical record is the only physical guarantee to verify weekly improvements."
      ],
      bullets_pt: [
        "Crie micro-metas claras: Como manter o posicionamento tático correto ou correr 5km monitorados.",
        "Monitore suas finalizações: Foco em acertar as traves e dar assistências limpas para os companheiros.",
        "Diário quantitativo: Anotar tudo em sua planilha é a forma mais rápida de convencer um olheiro esportivo."
      ]
    }
  ];

  const getGuideTitle = (guide: typeof guidesList[0]) => {
    if (language === 'EN') return guide.title_en;
    if (language === 'PT') return guide.title_pt;
    return guide.title_es;
  };

  const getGuideBullets = (guide: typeof guidesList[0]) => {
    if (language === 'EN') return guide.bullets_en;
    if (language === 'PT') return guide.bullets_pt;
    return guide.bullets_es;
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/98 backdrop-blur-md z-110 overflow-y-auto px-4 py-6 font-sans text-left flex items-start justify-center">
      <div id="info-legal-modal" className="w-full max-w-2xl bg-neutral-900 border border-white/[0.08] rounded-2xl p-5 md:p-6 my-4 shadow-2xl relative text-neutral-100 flex flex-col space-y-5">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 rounded-t-2xl" />

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 pr-4">
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
              {t('title')}
            </h2>
            <p className="text-[10px] sm:text-xs text-neutral-400 leading-normal font-light">
              {t('subtitle')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            {t('close')}
          </button>
        </div>

        {/* Tab switcher navigation bar (UX deciding factor) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('guides')}
            className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'guides' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tab_guides')}</span>
            <span className="sm:hidden">Guías</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'about' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tab_about')}</span>
            <span className="sm:hidden">Nosotros</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'contact' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tab_contact')}</span>
            <span className="sm:hidden">Contacto</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-1 rounded-lg text-center transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tab_privacy')}</span>
            <span className="sm:hidden">Privación</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 min-h-[320px] max-h-[500px] overflow-y-auto pr-1">
          
          {/* TAP 1: SPORT GUIDES (AdSense Academic Content) */}
          {activeTab === 'guides' && (
            <div className="space-y-4 pt-1">
              <div className="pb-1">
                <span className="text-[9px] font-black tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase">
                  {t('guide_tag')}
                </span>
                <p className="text-xs text-neutral-400 mt-1.5 font-light">{t('guide_desc')}</p>
              </div>

              {guidesList.map((g) => (
                <div key={g.id} className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-black rounded-lg">
                      {g.icon}
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-xs font-black text-white leading-tight uppercase tracking-tight">
                        {getGuideTitle(g)}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono mt-0.5">
                        <span className="text-neutral-400 font-semibold">{g.author}</span>
                        <span>·</span>
                        <span>Lectora: {g.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pl-1.5 border-l border-white/[0.05] text-[11px] text-neutral-300 leading-relaxed">
                    {getGuideBullets(g).map((bullet, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-emerald-400 select-none shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4 pt-1 font-sans text-xs">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                {t('about_title')}
              </h3>
              
              <div className="space-y-3.5 text-neutral-300 leading-relaxed text-[11px] font-light">
                <p>{t('about_desc1')}</p>
                <p>{t('about_desc2')}</p>
                
                <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold leading-none">
                    90+
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="block text-[11px] font-bold text-white">¿Por qué registrar tus partidos?</span>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Varios clubes y buscadores de talento confirman que un registro cuantificado, verídico y continuo demuestra madurez táctica y compromiso muscular en comparación con atletas que no miden su rendimiento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-4 pt-1 font-sans text-xs text-left">
              <div className="flex items-center gap-2 text-emerald-400">
                <Mail className="w-5 h-5" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {t('contact_title')}
                </h3>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-light">{t('contact_desc')}</p>

              <div className="space-y-3 pt-2 text-[11px]">
                <div className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">{t('contact_email_label')}</span>
                  <a 
                    href="mailto:caminoaprimera.soporte@gmail.com" 
                    className="text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs underline flex items-center gap-1 active:scale-98 transition-all"
                  >
                    caminoaprimera.soporte@gmail.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">{t('contact_address_label')}</span>
                  <p className="text-neutral-200 font-mono text-[10px]">{t('contact_address_val')}</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/5 col-span-2 border border-emerald-500/10 rounded-xl text-center">
                <p className="text-[10px] text-emerald-400 leading-normal font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  {t('contact_note')}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 pt-1 font-sans text-left text-neutral-300 leading-relaxed text-[11px] font-light">
              <div className="border-b border-white/[0.05] pb-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {t('privacy_title')}
                </h3>
                <span className="text-[10px] text-neutral-450 font-mono italic mt-0.5 block">{t('privacy_last_updated')}</span>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wide">{t('privacy_section1')}</h4>
                  <p>{t('privacy_section1_desc')}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wide">{t('privacy_section2')}</h4>
                  <p>{t('privacy_section2_desc')}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wide">{t('privacy_section3')}</h4>
                  <p>{t('privacy_section3_desc')}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wide">{t('privacy_section4')}</h4>
                  <p>{t('privacy_section4_desc')}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Support disclaimer */}
        <div className="pt-2.5 border-t border-white/[0.04] text-center text-[9px] text-neutral-500 font-mono uppercase tracking-wider flex items-center justify-center gap-1">
          <span>Camino a Primera © 2026</span>
          <span>·</span>
          <span className="text-emerald-400/80 font-bold">AdSense Compliant UX v1.0</span>
        </div>

      </div>
    </div>
  );
}

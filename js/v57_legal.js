import {supabase} from './supabase.js';
import {TERMS_HTML_V102,PRIVACY_HTML_V102} from './v102_legal_copy.js?v=1.0.1-p7.4r.4.14';

export const LEGAL_V57={
  termsVersion:"1.1",
  privacyVersion:"1.1",
  effectiveDate:"01/09/2026",
  termsHash:"v1.1-age-safety-and-liability",
  privacyHash:"v1.1-minors-age-and-transparency"
};

const TERMS_HTML="<p>TÉRMINOS Y CONDICIONES DE TT RIVALS — VERSIÓN 1.0</p>\n<p>Vigencia: 18 de agosto de 2026.</p>\n<h3><span>1.</span>OBJETO</h3>\n<p>TT Rivals es una plataforma digital orientada a la organización y seguimiento de actividad vinculada al tenis de mesa. Entre otras funciones, permite crear perfiles deportivos, registrar desafíos y partidos, participar en rankings, consultar estadísticas, organizar o participar en torneos, utilizar herramientas de entrenamiento y acceder a funciones sociales o competitivas.</p>\n<h3><span>2.</span>ACEPTACIÓN</h3>\n<p>Al crear una cuenta, la persona usuaria declara haber leído y aceptado estos Términos y haber leído la Política de Privacidad vigente. La aceptación queda asociada a la cuenta junto con la versión aceptada y la fecha registrada por el servidor.</p>\n<p>Si una modificación futura cambia de forma sustancial las reglas del servicio, TT Rivals podrá solicitar una nueva aceptación.</p>\n<h3><span>3.</span>CUENTA</h3>\n<p>Cada cuenta es personal. La persona usuaria debe proporcionar información razonablemente veraz, proteger sus credenciales y evitar prestar o compartir la cuenta de forma que pueda afectar la integridad de resultados, rankings o torneos.</p>\n<p>La persona usuaria es responsable de la actividad realizada desde su cuenta salvo acceso no autorizado debidamente comunicado.</p>\n<p>Si la persona usuaria es menor de edad, deberá utilizar TT Rivals con la autorización o asistencia que corresponda de su padre, madre, tutor o responsable legal.</p>\n<h3><span>4.</span>IDENTIDAD Y PERFIL</h3>\n<p>TT Rivals puede mostrar públicamente dentro del servicio determinados datos deportivos o de perfil, según la configuración de privacidad y las funcionalidades utilizadas, como nombre, usuario, fotografía, club, ranking, RP, títulos, logros, historial competitivo, estadísticas o reputación.</p>\n<p>El correo electrónico y las credenciales de autenticación no forman parte del perfil público.</p>\n<h3><span>5.</span>RESULTADOS, DESAFÍOS Y RP</h3>\n<p>Los resultados cargados deben corresponder a partidos realmente disputados cuando la función se utilice fuera de modos expresamente identificados como prueba.</p>\n<p>No está permitido coordinar resultados falsos, manipular partidas, crear cuentas con el fin de alterar rankings ni utilizar mecanismos artificiales para obtener RP, logros, títulos, posiciones o reputación.</p>\n<p>Las puntuaciones, rangos, RP, logros, marcos y demás elementos virtuales de TT Rivals no representan dinero, crédito ni un derecho económico.</p>\n<h3><span>6.</span>CONFIRMACIÓN Y DISPUTAS</h3>\n<p>Cuando una modalidad requiera confirmación del rival, el resultado no se considera definitivamente cerrado hasta completar el flujo previsto por el sistema. Ante una disputa, TT Rivals podrá mantener el encuentro sin confirmar, solicitar información adicional o aplicar medidas para preservar la integridad competitiva.</p>\n<h3><span>7.</span>TORNEOS</h3>\n<p>Los organizadores y participantes deben respetar la estructura y reglas informadas para cada torneo. Salvo indicación expresa, TT Rivals no representa ni sustituye a una federación, liga, club u organismo oficial y sus competiciones no tienen carácter federativo por el solo hecho de utilizar la aplicación.</p>\n<h3><span>8.</span>CONDUCTA</h3>\n<p>Se espera una conducta respetuosa. No se admite acoso, amenazas, suplantación de identidad, hostigamiento, fraude, publicación de contenido ilícito ni utilización del servicio para perjudicar a otras personas.</p>\n<h3><span>9.</span>SEGURIDAD Y USO PROHIBIDO</h3>\n<p>No está permitido:</p>\n<p>a) intentar eludir controles de autenticación, RLS, permisos de administrador o validaciones del servidor;</p>\n<p>b) explotar vulnerabilidades con la finalidad de modificar o extraer información sin autorización;</p>\n<p>c) automatizar altas, resultados, valoraciones o interacciones para manipular el servicio;</p>\n<p>d) introducir código malicioso, interferir con la disponibilidad o realizar ataques contra la infraestructura;</p>\n<p>e) acceder a datos de otras cuentas fuera de lo permitido por las funciones normales del servicio;</p>\n<p>f) utilizar credenciales, tokens o secretos obtenidos sin autorización.</p>\n<p>El hallazgo de una vulnerabilidad debe comunicarse responsablemente al operador del servicio y no explotarse más allá de lo estrictamente necesario para describirla.</p>\n<h3><span>10.</span>VALORACIONES</h3>\n<p>Las valoraciones entre jugadores deben reflejar una experiencia real y no utilizarse para acosar, extorsionar, castigar o manipular reputaciones. TT Rivals podrá retirar contenido o valoraciones manifiestamente abusivas o fraudulentas.</p>\n<h3><span>11.</span>PROPIEDAD INTELECTUAL</h3>\n<p>La denominación TT Rivals, su código, interfaces, diseños, textos originales, estructura visual, emblemas, marcos, elementos gráficos, documentación y demás desarrollos propios se encuentran protegidos por la normativa aplicable.</p>\n<p>Salvo autorización expresa, no se concede permiso para copiar, redistribuir, publicar, vender, explotar comercialmente o presentar como propio el código fuente, diseño o activos originales de TT Rivals.</p>\n<p>Las ideas generales, reglas deportivas y elementos pertenecientes a terceros conservan el régimen jurídico que les corresponda.</p>\n<h3><span>12.</span>CONTENIDO DE LAS PERSONAS USUARIAS</h3>\n<p>La persona usuaria conserva los derechos que le correspondan sobre su fotografía y demás contenido propio que incorpore. Al subirlo, autoriza a TT Rivals a almacenarlo, procesarlo y mostrarlo únicamente en la medida necesaria para prestar las funciones solicitadas.</p>\n<p>La persona usuaria declara que cuenta con derecho suficiente para utilizar el contenido que sube.</p>\n<h3><span>13.</span>DISPONIBILIDAD</h3>\n<p>TT Rivals puede encontrarse en desarrollo continuo. No se garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores. Podrán existir mantenimientos, cambios técnicos o interrupciones de proveedores externos.</p>\n<h3><span>14.</span>CAMBIOS DEL SERVICIO</h3>\n<p>TT Rivals puede agregar, modificar o retirar funciones para mejorar seguridad, estabilidad, experiencia o sostenibilidad del proyecto. Los cambios sustanciales que afecten derechos u obligaciones podrán dar lugar a una nueva versión de estos Términos.</p>\n<h3><span>15.</span>SUSPENSIÓN O LIMITACIÓN</h3>\n<p>Ante fraude, abuso, manipulación competitiva, amenazas a la seguridad o incumplimiento grave, TT Rivals podrá restringir temporalmente funciones, suspender una cuenta o adoptar medidas proporcionales para proteger a usuarios y al servicio.</p>\n<p>Cuando sea razonablemente posible se procurará evitar medidas arbitrarias y preservar la información necesaria para revisar el caso.</p>\n<h3><span>16.</span>ELIMINACIÓN DE CUENTA</h3>\n<p>La persona usuaria puede solicitar o ejecutar la eliminación de su cuenta mediante las herramientas disponibles. La eliminación puede estar sujeta a la conservación mínima de información cuando exista una obligación legal, una necesidad legítima de seguridad o integridad del sistema, o cuando ciertos registros deban mantenerse de forma disociada para no alterar resultados históricos de terceros.</p>\n<h3><span>17.</span>SERVICIOS DE TERCEROS</h3>\n<p>TT Rivals utiliza proveedores tecnológicos para autenticación, base de datos, almacenamiento, hosting u otras funciones. El uso de estos servicios puede quedar también sujeto a las condiciones técnicas de dichos proveedores.</p>\n<h3><span>18.</span>RESPONSABILIDAD</h3>\n<p>TT Rivals es una herramienta tecnológica y no reemplaza decisiones médicas, reglamentos federativos, seguros, supervisión profesional ni medidas de seguridad propias de la práctica deportiva.</p>\n<p>Cada persona es responsable de practicar deporte de acuerdo con su condición, el lugar, el equipamiento y las normas aplicables.</p>\n<h3><span>19.</span>LEY APLICABLE</h3>\n<p>Estos Términos se interpretan conforme a las leyes de la República Oriental del Uruguay, sin perjuicio de las normas imperativas que pudieran resultar aplicables.</p>\n<h3><span>20.</span>CONTACTO Y VERSIONES</h3>\n<p>Los datos de identificación y contacto del responsable se informan dentro de la sección Legal y Privacidad de TT Rivals. La versión vigente de estos Términos se encuentra identificada en la aplicación.</p>";
const PRIVACY_HTML="<p>POLÍTICA DE PRIVACIDAD DE TT RIVALS — VERSIÓN 1.0</p>\n<p>Vigencia: 18 de agosto de 2026.</p>\n<h3><span>1.</span>ALCANCE</h3>\n<p>Esta Política explica de qué manera TT Rivals trata datos personales cuando una persona crea una cuenta o utiliza sus funciones.</p>\n<h3><span>2.</span>RESPONSABLE Y CONTACTO</h3>\n<p>El responsable y el canal de contacto de privacidad se muestran en la sección Legal y Privacidad de la aplicación. Antes de una apertura pública general, el operador de TT Rivals debe mantener esos datos actualizados.</p>\n<h3><span>3.</span>DATOS QUE PUEDE TRATAR TT RIVALS</h3>\n<p>Según las funciones utilizadas, TT Rivals puede tratar:</p>\n<p>a) datos de cuenta: correo electrónico, identificador interno, usuario y datos necesarios para autenticación;</p>\n<p>b) datos de perfil: nombre, apellido, fecha de nacimiento cuando se proporcione, fotografía, club, mano dominante, estilo de juego y preferencias de visibilidad;</p>\n<p>c) datos competitivos: desafíos, partidos, sets, resultados, RP, ranking, estadísticas, abandonos, temporadas, torneos y participación en equipos;</p>\n<p>d) datos sociales: seguidores, cuentas seguidas, valoraciones, reputación, logros, títulos y elementos cosméticos;</p>\n<p>e) datos de entrenamiento configurados localmente durante el uso del cronómetro;</p>\n<p>f) datos de ubicación cuando la persona activa voluntariamente Jugadores cerca. La ubicación se utiliza para calcular proximidad; TT Rivals no tiene como finalidad mostrar coordenadas exactas a otros jugadores;</p>\n<p>g) datos técnicos necesarios para seguridad, sesión, prevención de abuso y funcionamiento del servicio.</p>\n<h3><span>4.</span>FINALIDADES</h3>\n<p>Los datos se utilizan para:</p>\n<ul>\n<li>crear y administrar la cuenta;</li>\n<li>autenticar a la persona;</li>\n<li>construir el perfil deportivo;</li>\n<li>gestionar desafíos, partidos, confirmaciones y disputas;</li>\n<li>calcular y mostrar RP, rankings, historial y estadísticas;</li>\n<li>operar torneos individuales, de dobles y por equipos;</li>\n<li>mostrar reputación, logros, títulos y elementos de perfil;</li>\n<li>ofrecer funciones sociales y de proximidad cuando se activan;</li>\n<li>prevenir fraude, abuso y manipulación;</li>\n<li>mejorar estabilidad y seguridad;</li>\n<li>atender solicitudes relacionadas con los datos personales.</li>\n</ul>\n<h3><span>5.</span>BASE DEL TRATAMIENTO</h3>\n<p>TT Rivals trata información en la medida necesaria para prestar las funciones solicitadas por la persona usuaria y, cuando corresponde, sobre la base del consentimiento otorgado para funciones opcionales o tratamientos que lo requieran.</p>\n<p>La activación de ubicación es voluntaria y puede deshabilitarse.</p>\n<h3><span>6.</span>DATOS PÚBLICOS Y DATOS PRIVADOS</h3>\n<p>Determinados datos deportivos están destinados a ser visibles dentro de TT Rivals, por ejemplo nombre o usuario, fotografía de perfil, club si se muestra, ranking, RP, resultados, estadísticas, logros o títulos.</p>\n<p>El correo de autenticación, la contraseña y los secretos de sesión no deben mostrarse públicamente.</p>\n<p>Las contraseñas no son almacenadas por TT Rivals en texto legible; la autenticación es gestionada mediante el proveedor de autenticación.</p>\n<h3><span>7.</span>PROVEEDORES</h3>\n<p>TT Rivals utiliza actualmente Supabase para funciones que pueden incluir autenticación, base de datos, almacenamiento y tiempo real. También puede utilizar un proveedor de hosting para servir la aplicación.</p>\n<p>Estos proveedores actúan como infraestructura tecnológica y pueden procesar datos para prestar los servicios contratados.</p>\n<h3><span>8.</span>TRANSFERENCIAS INTERNACIONALES</h3>\n<p>El uso de infraestructura tecnológica puede implicar procesamiento o alojamiento fuera de Uruguay. La sección Legal y Privacidad debe indicar el destino o región de infraestructura configurado por el responsable cuando corresponda.</p>\n<p>El responsable debe evaluar y documentar la base y garantías aplicables a cualquier transferencia internacional de datos.</p>\n<h3><span>9.</span>UBICACIÓN</h3>\n<p>Jugadores cerca es una función optativa. Cuando se activa, el dispositivo puede proporcionar coordenadas necesarias para calcular distancia aproximada. La finalidad es encontrar jugadores cercanos y no publicar la ubicación exacta.</p>\n<p>La persona puede desactivar la función y modificar su visibilidad.</p>\n<h3><span>10.</span>FOTOGRAFÍAS</h3>\n<p>Las fotografías de perfil son tratadas para identificar visualmente la cuenta dentro de TT Rivals. La persona puede sustituirlas o eliminarlas usando las herramientas disponibles.</p>\n<h3><span>11.</span>CONSERVACIÓN</h3>\n<p>Los datos se conservan mientras la cuenta se encuentre activa y durante el tiempo razonablemente necesario para la finalidad que motivó el tratamiento.</p>\n<p>Al eliminar una cuenta, TT Rivals procurará eliminar o desvincular la información personal asociada, salvo aquellos datos que deban conservarse por obligación legal, seguridad, prevención de fraude o integridad de registros compartidos con otras personas.</p>\n<h3><span>12.</span>DERECHOS</h3>\n<p>La persona puede ejercer los derechos reconocidos por la normativa uruguaya de protección de datos, incluidos acceso, rectificación, actualización y supresión cuando corresponda.</p>\n<p>TT Rivals incorpora herramientas para editar información de perfil, eliminar la cuenta y descargar un resumen de datos asociados. Para otras solicitudes puede utilizarse el canal de privacidad informado en la aplicación.</p>\n<h3><span>13.</span>SEGURIDAD</h3>\n<p>TT Rivals aplica medidas técnicas destinadas a limitar accesos no autorizados, incluyendo autenticación, permisos de base de datos, Row Level Security, funciones con validación de identidad y separación entre credenciales públicas y secretos de servidor.</p>\n<p>Ningún sistema puede garantizar riesgo cero; por ello la seguridad se revisa de forma periódica.</p>\n<h3><span>14.</span>ALMACENAMIENTO LOCAL Y SESIÓN</h3>\n<p>La aplicación puede utilizar almacenamiento del navegador para mantener la sesión de autenticación y datos técnicos necesarios para el funcionamiento. Este almacenamiento no se utiliza con la finalidad de vender información personal a anunciantes.</p>\n<h3><span>15.</span>MENORES</h3>\n<p>Si una persona menor de edad utiliza TT Rivals, deberá hacerlo con la autorización o asistencia que corresponda de su responsable legal. No se pretende recopilar deliberadamente información de menores en contravención de la normativa aplicable.</p>\n<h3><span>16.</span>DECISIONES AUTOMATIZADAS</h3>\n<p>TT Rivals utiliza cálculos automáticos para RP, rankings, estadísticas, logros y otros indicadores deportivos. Estos mecanismos tienen finalidad competitiva o informativa dentro de la plataforma y no buscan producir efectos jurídicos sobre la persona.</p>\n<h3><span>17.</span>MODIFICACIONES</h3>\n<p>Esta Política puede actualizarse por cambios legales, técnicos o funcionales. Cuando una modificación sea sustancial, TT Rivals puede solicitar que la persona revise y acepte o reconozca la nueva versión.</p>\n<h3><span>18.</span>LEY APLICABLE</h3>\n<p>Esta Política se rige por las leyes de la República Oriental del Uruguay, incluyendo la normativa aplicable en materia de protección de datos personales.</p>";

function esc(value){
  return String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

export async function getPublicLegalConfigV57(){
  const {data,error}=await supabase.rpc('get_public_legal_config_v57');
  if(error)throw error;
  return data||{};
}

export async function getMyLegalStatusV57(){
  const {data,error}=await supabase.rpc('get_my_legal_status_v57');
  if(error)throw error;
  return data||{accepted:false};
}

export async function recordMyLegalAcceptanceV57(){
  const {data,error}=await supabase.rpc('record_my_legal_acceptance_v57',{
    p_terms_version:LEGAL_V57.termsVersion,
    p_privacy_version:LEGAL_V57.privacyVersion
  });
  if(error)throw error;
  return data;
}

export async function exportMyDataV57(){
  const {data,error}=await supabase.rpc('export_my_data_v57');
  if(error)throw error;
  return data||{};
}

export async function adminSecurityAuditV57(){
  const {data,error}=await supabase.rpc('admin_security_audit_v57');
  if(error)throw error;
  return data||{};
}

export async function adminUpdateLegalConfigV57({
  responsibleName,
  responsibleAddress,
  privacyEmail,
  infrastructureDestination
}){
  const {data,error}=await supabase.rpc('admin_update_legal_config_v571',{
    p_responsible_name:responsibleName,
    p_responsible_address:responsibleAddress,
    p_privacy_email:privacyEmail,
    p_infrastructure_destination:infrastructureDestination
  });
  if(error)throw error;
  return data||{};
}

function legalMetaHtml(config={}){
  const responsibleName=String(config.responsible_name||'').trim();
  const responsible=responsibleName&&responsibleName.toLowerCase()!=='tt rivals'
    ?esc(responsibleName)
    :'<span class="legal-pending-v57">Identidad legal del responsable pendiente de completar</span>';
  const address=config.responsible_address
    ?esc(config.responsible_address)
    :'<span class="legal-pending-v57">Domicilio pendiente de configuración</span>';
  const country=esc(config.responsible_country||'Uruguay');
  const email=config.privacy_email
    ?`<a href="mailto:${esc(config.privacy_email)}">${esc(config.privacy_email)}</a>`
    :'<span class="legal-pending-v57">Canal de privacidad pendiente de configuración</span>';
  const provider=esc(config.infrastructure_provider||'Supabase');
  const infra=config.infrastructure_destination
    ?esc(config.infrastructure_destination)
    :'<span class="legal-pending-v57">Región/ubicación pendiente de verificación</span>';

  return `<aside class="legal-facts-v57 legal-facts-v571">
    <div><span>Responsable</span><strong>${responsible}</strong></div>
    <div><span>Domicilio del responsable</span><strong>${address}</strong></div>
    <div><span>País</span><strong>${country}</strong></div>
    <div><span>Contacto de privacidad</span><strong>${email}</strong></div>
    <div><span>Proveedor tecnológico</span><strong>${provider}</strong></div>
    <div><span>Región / ubicación infraestructura</span><strong>${infra}</strong></div>
  </aside>`;
}

export function renderLegalDocumentV57(type,config={}){
  const terms=type==='terms';
  const body=terms?TERMS_HTML_V102:PRIVACY_HTML_V102;
  const version=terms?LEGAL_V57.termsVersion:LEGAL_V57.privacyVersion;
  const title=terms?'Términos y Condiciones':'Política de Privacidad';

  return `<div class="legal-document-v57">
    <header>
      <p>TT RIVALS · LEGAL</p>
      <h2>${title}</h2>
      <span>Versión ${version} · Vigente desde ${LEGAL_V57.effectiveDate}</span>
    </header>
    ${legalMetaHtml(config)}
    <div class="legal-document-body-v57">${body}</div>
    <footer>
      <strong>Versión ${version}</strong>
      <span>Este documento forma parte del sistema de aceptación versionada de TT Rivals.</span>
    </footer>
  </div>`;
}

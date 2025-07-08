export const frasesOraculo = [
  "Los caminos del destino son misteriosos.",
  "Tu deseo navega entre las sombras del azar.",
  "Las cartas murmuran un antiguo secreto.",
  "Paciencia… el oráculo habla en su momento.",
  "Hoy el destino puede sonreírte… o no.",
  "Las estrellas susurran secretos a las cartas.",
  "El tiempo revela lo que el corazón desea.",
  "Cada carta lleva un fragmento de tu destino.",
  "La fortuna danza al ritmo de los elementos.",
  "El universo conspira en tu favor... o tal vez no.",
  "Los números hablan un lenguaje ancestral.",
  "Tu pregunta resuena en las dimensiones ocultas.",
  "El azar es solo otra forma de magia.",
  "Las cartas conocen verdades que tú aún ignoras.",
  "El destino teje su red con hilos dorados."
];

export const frasesFinales = {
  exito: [
    "¡Las estrellas se han alineado a tu favor!",
    "El oráculo sonríe... tu destino es próspero.",
    "Los dioses del azar han escuchado tu llamado.",
    "Tu energía ha logrado ordenar el caos universal.",
    "¡La fortuna te bendice en este momento!"
  ],
  fracaso: [
    "El destino mantiene sus secretos por ahora.",
    "Las fuerzas cósmicas no están alineadas... aún.",
    "El oráculo necesita más tiempo para revelar la verdad.",
    "Tu camino requiere más reflexión y paciencia.",
    "No todo está perdido... el universo tiene otros planes."
  ]
};

export const getRandomPhrase = (phrases) => {
  return phrases[Math.floor(Math.random() * phrases.length)];
};

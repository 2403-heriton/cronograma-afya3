import type { AulaEntry, Event } from '../types';

export const defaultAulas: AulaEntry[] = [
  {
    "periodo": "1",
    "modulo": "Módulo I",
    "grupo": "A",
    "dia_semana": "Segunda-feira",
    "horario_inicio": "08:00",
    "horario_fim": "10:00",
    "disciplina": "Bases Morfológicas I",
    "sala": "Lab Morfo 1"
  },
  {
    "periodo": "1",
    "modulo": "Módulo I",
    "grupo": "A",
    "dia_semana": "Segunda-feira",
    "horario_inicio": "10:00",
    "horario_fim": "12:00",
    "disciplina": "Introdução ao Estudo da Medicina I",
    "sala": "Sala 101"
  },
  {
    "periodo": "1",
    "modulo": "Módulo I",
    "grupo": "B",
    "dia_semana": "Segunda-feira",
    "horario_inicio": "08:00",
    "horario_fim": "10:00",
    "disciplina": "Introdução ao Estudo da Medicina I",
    "sala": "Sala 102"
  },
  {
    "periodo": "1",
    "modulo": "Módulo I",
    "grupo": "B",
    "dia_semana": "Segunda-feira",
    "horario_inicio": "10:00",
    "horario_fim": "12:00",
    "disciplina": "Bases Morfológicas I",
    "sala": "Lab Morfo 2"
  },
   {
    "periodo": "1",
    "modulo": "Módulo I",
    "grupo": "A",
    "dia_semana": "Terça-feira",
    "horario_inicio": "08:00",
    "horario_fim": "10:00",
    "disciplina": "Bases Celulares e Moleculares I",
    "sala": "Lab BioCel"
  },
  {
    "periodo": "1",
    "modulo": "Módulo II",
    "grupo": "A",
    "dia_semana": "Terça-feira",
    "horario_inicio": "14:00",
    "horario_fim": "16:00",
    "disciplina": "Bases Morfológicas II",
    "sala": "Lab Morfo 3"
  },
  {
    "periodo": "2",
    "modulo": "Módulo III",
    "grupo": "C",
    "dia_semana": "Quarta-feira",
    "horario_inicio": "09:00",
    "horario_fim": "11:00",
    "disciplina": "Habilidades Médicas I",
    "sala": "Sala 201"
  }
];


export const defaultEvents: Event[] = [
  {
    "periodo": "Geral",
    "data": "20/08/2024",
    "horario": "18:00",
    "disciplina": "Palestra",
    "tipo": "Abertura da Liga de Cardiologia",
    "local": "Auditório Principal",
    "modulo": "N/A",
    "grupo": "N/A"
  },
  {
    "periodo": "1",
    "data": "15/08/2024",
    "horario": "09:00",
    "disciplina": "Bases Morfológicas I",
    "tipo": "Prova Parcial",
    "local": "Anfiteatro",
    "modulo": "Módulo I",
    "grupo": "Todos"
  },
  {
    "periodo": "2",
    "data": "25/08/2024",
    "horario": "14:00",
    "disciplina": "Habilidades Médicas I",
    "tipo": "Avaliação Prática",
    "local": "Centro de Habilidades",
    "modulo": "Módulo III",
    "grupo": "C"
  }
];
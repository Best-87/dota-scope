import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Swords,
  Shield,
  ShieldAlert,
  Zap,
  Flame,
  Sparkles,
  Heart,
  HeartHandshake,
  Lock,
  Plus,
  X,
  Search,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  Target,
  Eye,
  Trophy,
  HelpCircle,
  ArrowRight,
  Sparkle,
} from 'lucide-react';

/* =========================================================================
   Types & Interfaces
   ========================================================================= */

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string; // 'str' | 'agi' | 'int' | 'all'
  attack_type: string;
  roles: string[];
  img?: string;
  icon?: string;
}

interface TeamSlot {
  hero: Hero | null;
}

interface SynergyDefinition {
  id: string;
  name: string;
  description: string;
  impact: string;
  detect: (heroes: Hero[]) => { active: boolean; participants: Hero[] };
}

interface CounterRule {
  counters: Array<{ name: string; reason: string }>;
  counteredBy: Array<{ name: string; reason: string }>;
}

/* =========================================================================
   Constants & Cache Configuration
   ========================================================================= */

const HEROES_CACHE_KEY = 'dotascope_draft_heroes_cache_v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getHeroKey = (name: string): string => {
  if (!name) return '';
  return name.replace(/^npc_dota_hero_/, '');
};

export const getHeroImageUrl = (hero: Hero | null | undefined): string => {
  if (!hero || !hero.name) return '';
  const heroKey = getHeroKey(hero.name);
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroKey}.png`;
};

/* =========================================================================
   Curated Dota 2 Fallback Heroes (Embedded Data)
   ========================================================================= */

const FALLBACK_HEROES: Hero[] = [
  { id: 1, name: 'npc_dota_hero_antimage', localized_name: 'Anti-Mage', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Nuker'] },
  { id: 2, name: 'npc_dota_hero_axe', localized_name: 'Axe', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator', 'Durable', 'Disabler', 'Carry'] },
  { id: 3, name: 'npc_dota_hero_bane', localized_name: 'Bane', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker'] },
  { id: 4, name: 'npc_dota_hero_bloodseeker', localized_name: 'Bloodseeker', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Disabler', 'Nuker', 'Initiator'] },
  { id: 5, name: 'npc_dota_hero_crystal_maiden', localized_name: 'Crystal Maiden', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker'] },
  { id: 6, name: 'npc_dota_hero_drow_ranger', localized_name: 'Drow Ranger', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Disabler', 'Pusher'] },
  { id: 7, name: 'npc_dota_hero_earthshaker', localized_name: 'Earthshaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Support', 'Initiator', 'Disabler', 'Nuker'] },
  { id: 8, name: 'npc_dota_hero_juggernaut', localized_name: 'Juggernaut', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Pusher', 'Escape'] },
  { id: 9, name: 'npc_dota_hero_mirana', localized_name: 'Mirana', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry', 'Support', 'Escape', 'Nuker', 'Disabler'] },
  { id: 10, name: 'npc_dota_hero_morphling', localized_name: 'Morphling', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Escape', 'Durable', 'Nuker'] },
  { id: 11, name: 'npc_dota_hero_nevermore', localized_name: 'Shadow Fiend', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Nuker'] },
  { id: 12, name: 'npc_dota_hero_phantom_lancer', localized_name: 'Phantom Lancer', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Pusher'] },
  { id: 13, name: 'npc_dota_hero_puck', localized_name: 'Puck', primary_attr: 'int', attack_type: 'Ranged', roles: ['Initiator', 'Disabler', 'Nuker', 'Escape'] },
  { id: 14, name: 'npc_dota_hero_pudge', localized_name: 'Pudge', primary_attr: 'str', attack_type: 'Melee', roles: ['Disabler', 'Initiator', 'Durable', 'Nuker'] },
  { id: 15, name: 'npc_dota_hero_razor', localized_name: 'Razor', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Durable', 'Nuker', 'Pusher'] },
  { id: 16, name: 'npc_dota_hero_sand_king', localized_name: 'Sand King', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator', 'Disabler', 'Support', 'Nuker', 'Escape'] },
  { id: 17, name: 'npc_dota_hero_storm_spirit', localized_name: 'Storm Spirit', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Escape', 'Nuker', 'Initiator', 'Disabler'] },
  { id: 18, name: 'npc_dota_hero_sven', localized_name: 'Sven', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Disabler', 'Initiator', 'Durable', 'Nuker'] },
  { id: 19, name: 'npc_dota_hero_tiny', localized_name: 'Tiny', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Nuker', 'Pusher', 'Initiator', 'Durable', 'Disabler'] },
  { id: 20, name: 'npc_dota_hero_vengefulspirit', localized_name: 'Vengeful Spirit', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Initiator', 'Disabler', 'Nuker', 'Escape'] },
  { id: 21, name: 'npc_dota_hero_windrunner', localized_name: 'Windranger', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry', 'Support', 'Disabler', 'Nuker', 'Escape'] },
  { id: 22, name: 'npc_dota_hero_zuus', localized_name: 'Zeus', primary_attr: 'int', attack_type: 'Ranged', roles: ['Nuker', 'Carry'] },
  { id: 23, name: 'npc_dota_hero_kunkka', localized_name: 'Kunkka', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Support', 'Disabler', 'Initiator', 'Durable', 'Nuker'] },
  { id: 25, name: 'npc_dota_hero_lina', localized_name: 'Lina', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Carry', 'Nuker', 'Disabler'] },
  { id: 26, name: 'npc_dota_hero_lion', localized_name: 'Lion', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker', 'Initiator'] },
  { id: 27, name: 'npc_dota_hero_shadow_shaman', localized_name: 'Shadow Shaman', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Pusher', 'Disabler', 'Nuker', 'Initiator'] },
  { id: 28, name: 'npc_dota_hero_slardar', localized_name: 'Slardar', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Durable', 'Initiator', 'Disabler', 'Escape'] },
  { id: 29, name: 'npc_dota_hero_tidehunter', localized_name: 'Tidehunter', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator', 'Durable', 'Disabler', 'Support'] },
  { id: 30, name: 'npc_dota_hero_witch_doctor', localized_name: 'Witch Doctor', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Nuker', 'Disabler'] },
  { id: 31, name: 'npc_dota_hero_lich', localized_name: 'Lich', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Nuker'] },
  { id: 32, name: 'npc_dota_hero_riki', localized_name: 'Riki', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Disabler'] },
  { id: 33, name: 'npc_dota_hero_enigma', localized_name: 'Enigma', primary_attr: 'all', attack_type: 'Ranged', roles: ['Disabler', 'Initiator', 'Pusher'] },
  { id: 34, name: 'npc_dota_hero_tinker', localized_name: 'Tinker', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Pusher'] },
  { id: 35, name: 'npc_dota_hero_sniper', localized_name: 'Sniper', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Nuker'] },
  { id: 36, name: 'npc_dota_hero_necrolyte', localized_name: 'Necrophos', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Durable', 'Disabler'] },
  { id: 39, name: 'npc_dota_hero_queenofpain', localized_name: 'Queen of Pain', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Escape'] },
  { id: 41, name: 'npc_dota_hero_faceless_void', localized_name: 'Faceless Void', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Initiator', 'Disabler', 'Escape', 'Durable'] },
  { id: 42, name: 'npc_dota_hero_skeleton_king', localized_name: 'Wraith King', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Support', 'Durable', 'Disabler', 'Initiator'] },
  { id: 44, name: 'npc_dota_hero_phantom_assassin', localized_name: 'Phantom Assassin', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape'] },
  { id: 45, name: 'npc_dota_hero_pugna', localized_name: 'Pugna', primary_attr: 'int', attack_type: 'Ranged', roles: ['Nuker', 'Pusher'] },
  { id: 46, name: 'npc_dota_hero_templar_assassin', localized_name: 'Templar Assassin', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Escape'] },
  { id: 47, name: 'npc_dota_hero_viper', localized_name: 'Viper', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Durable', 'Initiator', 'Disabler'] },
  { id: 48, name: 'npc_dota_hero_luna', localized_name: 'Luna', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Pusher'] },
  { id: 49, name: 'npc_dota_hero_dragon_knight', localized_name: 'Dragon Knight', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Pusher', 'Durable', 'Disabler', 'Initiator'] },
  { id: 50, name: 'npc_dota_hero_dazzle', localized_name: 'Dazzle', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Nuker', 'Disabler'] },
  { id: 51, name: 'npc_dota_hero_rattletrap', localized_name: 'Clockwerk', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator', 'Disabler', 'Durable', 'Nuker'] },
  { id: 52, name: 'npc_dota_hero_leshrac', localized_name: 'Leshrac', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Support', 'Nuker', 'Pusher', 'Disabler'] },
  { id: 53, name: 'npc_dota_hero_furion', localized_name: "Nature's Prophet", primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Pusher', 'Escape', 'Nuker'] },
  { id: 54, name: 'npc_dota_hero_life_stealer', localized_name: 'Lifestealer', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Durable', 'Escape', 'Disabler'] },
  { id: 55, name: 'npc_dota_hero_dark_seer', localized_name: 'Dark Seer', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator', 'Escape', 'Disabler'] },
  { id: 57, name: 'npc_dota_hero_omniknight', localized_name: 'Omniknight', primary_attr: 'str', attack_type: 'Melee', roles: ['Support', 'Durable', 'Nuker'] },
  { id: 58, name: 'npc_dota_hero_enchantress', localized_name: 'Enchantress', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Pusher', 'Durable', 'Disabler'] },
  { id: 59, name: 'npc_dota_hero_huskar', localized_name: 'Huskar', primary_attr: 'str', attack_type: 'Ranged', roles: ['Carry', 'Durable', 'Initiator'] },
  { id: 60, name: 'npc_dota_hero_night_stalker', localized_name: 'Night Stalker', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Initiator', 'Durable', 'Disabler', 'Nuker'] },
  { id: 62, name: 'npc_dota_hero_bounty_hunter', localized_name: 'Bounty Hunter', primary_attr: 'agi', attack_type: 'Melee', roles: ['Escape', 'Nuker'] },
  { id: 64, name: 'npc_dota_hero_jakiro', localized_name: 'Jakiro', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Nuker', 'Pusher', 'Disabler'] },
  { id: 65, name: 'npc_dota_hero_batrider', localized_name: 'Batrider', primary_attr: 'all', attack_type: 'Ranged', roles: ['Initiator', 'Disabler', 'Escape'] },
  { id: 67, name: 'npc_dota_hero_spectre', localized_name: 'Spectre', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Durable', 'Escape'] },
  { id: 68, name: 'npc_dota_hero_ancient_apparition', localized_name: 'Ancient Apparition', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker'] },
  { id: 69, name: 'npc_dota_hero_doom_bringer', localized_name: 'Doom', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Disabler', 'Initiator', 'Durable', 'Nuker'] },
  { id: 70, name: 'npc_dota_hero_ursa', localized_name: 'Ursa', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Durable', 'Disabler'] },
  { id: 71, name: 'npc_dota_hero_spirit_breaker', localized_name: 'Spirit Breaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator', 'Durable', 'Disabler', 'Escape'] },
  { id: 72, name: 'npc_dota_hero_gyrocopter', localized_name: 'Gyrocopter', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Disabler'] },
  { id: 73, name: 'npc_dota_hero_alchemist', localized_name: 'Alchemist', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Support', 'Durable', 'Disabler', 'Nuker', 'Initiator'] },
  { id: 74, name: 'npc_dota_hero_invoker', localized_name: 'Invoker', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Disabler', 'Escape', 'Pusher'] },
  { id: 75, name: 'npc_dota_hero_silencer', localized_name: 'Silencer', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Support', 'Disabler', 'Nuker'] },
  { id: 76, name: 'npc_dota_hero_obsidian_destroyer', localized_name: 'Outworld Destroyer', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Disabler'] },
  { id: 82, name: 'npc_dota_hero_meepo', localized_name: 'Meepo', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Nuker', 'Disabler', 'Initiator', 'Pusher'] },
  { id: 84, name: 'npc_dota_hero_ogre_magi', localized_name: 'Ogre Magi', primary_attr: 'str', attack_type: 'Melee', roles: ['Support', 'Nuker', 'Disabler', 'Durable', 'Initiator'] },
  { id: 86, name: 'npc_dota_hero_rubick', localized_name: 'Rubick', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker'] },
  { id: 87, name: 'npc_dota_hero_disruptor', localized_name: 'Disruptor', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker', 'Initiator'] },
  { id: 88, name: 'npc_dota_hero_nyx_assassin', localized_name: 'Nyx Assassin', primary_attr: 'all', attack_type: 'Melee', roles: ['Disabler', 'Nuker', 'Initiator', 'Escape'] },
  { id: 93, name: 'npc_dota_hero_slark', localized_name: 'Slark', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Disabler', 'Nuker'] },
  { id: 94, name: 'npc_dota_hero_medusa', localized_name: 'Medusa', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry', 'Disabler', 'Durable'] },
  { id: 96, name: 'npc_dota_hero_centaur', localized_name: 'Centaur Warrunner', primary_attr: 'str', attack_type: 'Melee', roles: ['Durable', 'Initiator', 'Disabler', 'Nuker'] },
  { id: 97, name: 'npc_dota_hero_magnataur', localized_name: 'Magnus', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator', 'Disabler', 'Nuker', 'Escape'] },
  { id: 98, name: 'npc_dota_hero_shredder', localized_name: 'Timbersaw', primary_attr: 'all', attack_type: 'Melee', roles: ['Nuker', 'Durable', 'Escape'] },
  { id: 99, name: 'npc_dota_hero_bristleback', localized_name: 'Bristleback', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Durable', 'Initiator', 'Nuker'] },
  { id: 104, name: 'npc_dota_hero_legion_commander', localized_name: 'Legion Commander', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Disabler', 'Initiator', 'Durable', 'Nuker'] },
  { id: 111, name: 'npc_dota_hero_oracle', localized_name: 'Oracle', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support', 'Nuker', 'Disabler', 'Escape'] },
  { id: 112, name: 'npc_dota_hero_winter_wyvern', localized_name: 'Winter Wyvern', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Disabler', 'Nuker'] },
  { id: 114, name: 'npc_dota_hero_monkey_king', localized_name: 'Monkey King', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry', 'Escape', 'Disabler', 'Initiator'] },
  { id: 128, name: 'npc_dota_hero_snapfire', localized_name: 'Snapfire', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support', 'Nuker', 'Disabler', 'Escape'] },
  { id: 129, name: 'npc_dota_hero_mars', localized_name: 'Mars', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator', 'Durable', 'Disabler', 'Carry'] },
  { id: 135, name: 'npc_dota_hero_dawnbreaker', localized_name: 'Dawnbreaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry', 'Durable'] },
  { id: 137, name: 'npc_dota_hero_primal_beast', localized_name: 'Primal Beast', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator', 'Durable', 'Disabler'] },
  { id: 138, name: 'npc_dota_hero_muerta', localized_name: 'Muerta', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry', 'Nuker', 'Disabler'] },
];

/* =========================================================================
   Dota 2 Counter Matchups Knowledge Base
   ========================================================================= */

const HERO_COUNTERS_DB: Record<string, { counters: string[]; counteredBy: Array<{ name: string; reason: string }> }> = {
  'Phantom Assassin': {
    counters: ['Sniper', 'Drow Ranger', 'Crystal Maiden', 'Zeus'],
    counteredBy: [
      { name: 'Axe', reason: 'Berserker\'s Call ignora la evasión y Blade Mail la destruye.' },
      { name: 'Lina', reason: 'Burst mágico masivo antes de que consiga Black King Bar.' },
      { name: 'Viper', reason: 'Nethertoxin aplica Break y anula Blur y Golpe de Gracia.' },
      { name: 'Lion', reason: 'Controles continuos instantáneos y Finger of Death letal.' },
    ],
  },
  'Anti-Mage': {
    counters: ['Medusa', 'Storm Spirit', 'Wraith King', 'Zeus', 'Leshrac', 'Pugna'],
    counteredBy: [
      { name: 'Legion Commander', reason: 'Duelo instantáneo con daño suficiente para matarlo sin Blink.' },
      { name: 'Bloodseeker', reason: 'Rupture evita totalmente su movilidad y parpadeo.' },
      { name: 'Disruptor', reason: 'Static Storm con cetro silencia y anula objetos y Blink.' },
      { name: 'Faceless Void', reason: 'Chronosphere lo congela antes de que pueda reaccionar.' },
    ],
  },
  'Bristleback': {
    counters: ['Phantom Assassin', 'Luna', 'Chaos Knight', 'Lycan'],
    counteredBy: [
      { name: 'Viper', reason: 'Nethertoxin aplica Break desactivando toda su reducción de daño.' },
      { name: 'Slark', reason: 'Roba agilidad continuamente mientras Bristleback aguanta.' },
      { name: 'Necrophos', reason: 'Reaper\'s Scythe castiga su enorme reserva de vida.' },
      { name: 'Legion Commander', reason: 'Duel lo obliga a encararla perdiendo el beneficio de su espalda.' },
    ],
  },
  'Huskar': {
    counters: ['Templar Assassin', 'Zeus', 'Venomancer'],
    counteredBy: [
      { name: 'Ancient Apparition', reason: 'Ice Blast bloquea totalmente su regeneración de vida.' },
      { name: 'Necrophos', reason: 'Reaper\'s Scythe remata instantáneamente con poca vida.' },
      { name: 'Viper', reason: 'Aplica Break y reduce drásticamente su velocidad de ataque.' },
      { name: 'Axe', reason: 'Culling Blade lo ejecuta ignorando cualquier resistencia.' },
    ],
  },
  'Medusa': {
    counters: ['Enigma', 'Puck', 'Faceless Void'],
    counteredBy: [
      { name: 'Anti-Mage', reason: 'Mana Break y Mana Void vacían su escudo y la aniquilan.' },
      { name: 'Nyx Assassin', reason: 'Mind Flare y Mana Burn destruyen su reserva de maná.' },
      { name: 'Invoker', reason: 'EMP masivo drena su escudo antes de iniciar peleas.' },
      { name: 'Slark', reason: 'Roba stats sin sufrir por su bajo daño unitario temprano.' },
    ],
  },
  'Sniper': {
    counters: ['Drow Ranger', 'Medusa', 'Enigma', 'Venomancer'],
    counteredBy: [
      { name: 'Clockwerk', reason: 'Hookshot y Battery Assault cierran distancia y cancelan su ataque.' },
      { name: 'Spectre', reason: 'Haunt salta directamente sobre él anulando su ventaja de rango.' },
      { name: 'Storm Spirit', reason: 'Iniciación con Ball Lightning desde cualquier punto del mapa.' },
      { name: 'Spirit Breaker', reason: 'Carga global que no le permite posicionarse seguro.' },
    ],
  },
  'Pudge': {
    counters: ['Crystal Maiden', 'Sniper', 'Drow Ranger'],
    counteredBy: [
      { name: 'Lifestealer', reason: 'Feast causa daño porcentual basado en la enorme vida de Pudge.' },
      { name: 'Ursa', reason: 'Fury Swipes derrite a Pudge en segundos cuerpo a cuerpo.' },
      { name: 'Slark', reason: 'Robo infinito de esencia y purga fácil con Dark Pact.' },
      { name: 'Timbersaw', reason: 'Whirling Death reduce su fuerza base y Pure Damage masivo.' },
    ],
  },
  'Axe': {
    counters: ['Phantom Assassin', 'Dazzle', 'Phantom Lancer', 'Huskar'],
    counteredBy: [
      { name: 'Viper', reason: 'Ralentizaciones y daño a distancia sin tocarlo en cuerpo a cuerpo.' },
      { name: 'Timbersaw', reason: 'Daño puro de corto alcance que supera su armadura.' },
      { name: 'Ursa', reason: 'Gana cualquier intercambio antes de que Axe gire con suficiente daño.' },
      { name: 'Outworld Destroyer', reason: 'Astral Imprisonment cancela su llamada e ignora su armadura.' },
    ],
  },
  'Enigma': {
    counters: ['Phantom Lancer', 'Meepo', 'Wraith King'],
    counteredBy: [
      { name: 'Silencer', reason: 'Global Silence cancela Black Hole a través de cualquier distancia.' },
      { name: 'Rubick', reason: 'Roba Black Hole con facilidad gracias a su largo alcance de casteo.' },
      { name: 'Vengeful Spirit', reason: 'Nether Swap interrumpe la canalización incluso con BKB.' },
      { name: 'Clockwerk', reason: 'Hookshot aturde a través de BKB e interrumpe Black Hole.' },
    ],
  },
  'Faceless Void': {
    counters: ['Storm Spirit', 'Slark', 'Weaver', 'Anti-Mage'],
    counteredBy: [
      { name: 'Shadow Demon', reason: 'Disruption salva al aliado atrapado en Chronosphere.' },
      { name: 'Vengeful Spirit', reason: 'Nether Swap rescata a su núcleo del Chronosphere.' },
      { name: 'Omniknight', reason: 'Guardian Angel reduce a cero el daño físico de su ulti.' },
      { name: 'Wraith King', reason: 'Reencarna después de que termine la duración del Chronosphere.' },
    ],
  },
  'Storm Spirit': {
    counters: ['Sniper', 'Tinker', 'Shadow Fiend'],
    counteredBy: [
      { name: 'Silencer', reason: 'Global Silence e inmunidad cancelan sus saltos en seco.' },
      { name: 'Disruptor', reason: 'Static Storm con Cetro impide que active Ball Lightning.' },
      { name: 'Doom', reason: 'Doom lo inutiliza por completo durante 16 segundos.' },
      { name: 'Anti-Mage', reason: 'Mana Void explota proporcionalmente a su alto maná faltante.' },
    ],
  },
  'Tidehunter': {
    counters: ['Phantom Assassin', 'Sven', 'Windranger'],
    counteredBy: [
      { name: 'Slark', reason: 'Roba atributos sin verse afectado por Anchor Smash.' },
      { name: 'Timbersaw', reason: 'Whirling Death drena su fuerza y reduce drásticamente su tanqueo.' },
      { name: 'Ursa', reason: 'Daño continuo acumulativo que supera Kraken Shell.' },
      { name: 'Viper', reason: 'Break desactiva Kraken Shell impidiendo que se purgue.' },
    ],
  },
  'Slark': {
    counters: ['Pudge', 'Tidehunter', 'Spectre', 'Drow Ranger'],
    counteredBy: [
      { name: 'Bloodseeker', reason: 'Thirst revela su posición permanentemente si tiene poca vida.' },
      { name: 'Disruptor', reason: 'Kinetic Field + Static Storm impiden saltar o usar Shadow Dance.' },
      { name: 'Axe', reason: 'Berserker\'s Call atraviesa la invisibilidad de Shadow Dance.' },
      { name: 'Legion Commander', reason: 'Duel es inerrable e impurificable con Dark Pact.' },
    ],
  },
  'Morphling': {
    counters: ['Drow Ranger', 'Sniper', 'Lifestealer'],
    counteredBy: [
      { name: 'Ancient Apparition', reason: 'Ice Blast frena totalmente su cambio de fuerza y curación.' },
      { name: 'Lion', reason: 'Burst mágico fulminante antes de que cambie sus atributos a fuerza.' },
      { name: 'Doom', reason: 'Doom anula su capacidad de cambiar stats y sus hechizos.' },
      { name: 'Skywrath Mage', reason: 'Silencio y daño mágico explosivo en early y mid game.' },
    ],
  },
  'Zeus': {
    counters: ['Tinker', 'Terrorblade', 'Crystal Maiden'],
    counteredBy: [
      { name: 'Anti-Mage', reason: 'Resistencia mágica innata y salto directo con Mana Void letal.' },
      { name: 'Spectre', reason: 'Haunt le salta en la espalda reflejando su propio daño.' },
      { name: 'Nyx Assassin', reason: 'Spiked Carapace aturde a Zeus cuando lanza su ulti global.' },
      { name: 'Templar Assassin', reason: 'Refraction absorbe ráfagas enteras de daño mágico.' },
    ],
  },
  'Earthshaker': {
    counters: ['Phantom Lancer', 'Meepo', 'Broodmother', 'Chaos Knight'],
    counteredBy: [
      { name: 'Clockwerk', reason: 'Battery Assault no le permite completar sus animaciones lentas.' },
      { name: 'Silencer', reason: 'Global Silence arruina su combinación con Blink Dagger.' },
      { name: 'Spectre', reason: 'Desactiva su Blink Dagger en todo momento con Haunt.' },
      { name: 'Rubick', reason: 'Roba Fissure o Echo Slam con casteo instantáneo sin animación.' },
    ],
  },
  'Phantom Lancer': {
    counters: ['Wraith King', 'Single-target carries', 'Sniper'],
    counteredBy: [
      { name: 'Earthshaker', reason: 'Echo Slam inflige daño exponencial por cada ilusión enemiga.' },
      { name: 'Sven', reason: 'Great Cleave desintegra a todas las ilusiones en dos golpes.' },
      { name: 'Leshrac', reason: 'Daño de área constante que barre las copias al instante.' },
      { name: 'Sand King', reason: 'Epicenter y Caustic Finale causan explosiones en cadena.' },
    ],
  },
  'Meepo': {
    counters: ['Anti-Mage', 'Drow Ranger', 'Storm Spirit'],
    counteredBy: [
      { name: 'Winter Wyvern', reason: 'Winter\'s Curse hace que todos los Meepos se maten entre sí.' },
      { name: 'Earthshaker', reason: 'Echo Slam masivo sobre la manada de clones.' },
      { name: 'Sven', reason: 'Golpes de área masivos con hendidura y God\'s Strength.' },
      { name: 'Lich', reason: 'Chain Frost rebota sin fin entre todos los clones.' },
    ],
  },
};

/* =========================================================================
   Predefined Synergy Detector
   ========================================================================= */

const SYNERGY_DEFINITIONS: SynergyDefinition[] = [
  {
    id: 'teamfight',
    name: 'Combo de Teamfight',
    description: 'Iniciación con aturdimiento en área + ráfagas devastadoras de daño masivo.',
    impact: 'Excelente para disputar Roshan y pelear en áreas estrechas 5v5.',
    detect: (heroes) => {
      const aoeStunners = heroes.filter((h) =>
        ['Earthshaker', 'Tidehunter', 'Magnus', 'Enigma', 'Faceless Void', 'Centaur Warrunner', 'Sand King', 'Mars', 'Slardar', 'Sven'].includes(
          h.localized_name
        )
      );
      const aoeDamagers = heroes.filter((h) =>
        ['Invoker', 'Leshrac', 'Phoenix', 'Crystal Maiden', 'Lich', 'Disruptor', 'Gyrocopter', 'Snapfire', 'Lina', 'Pugna', 'Outworld Destroyer'].includes(
          h.localized_name
        ) || (h.roles?.includes('Nuker') && h.roles?.includes('Carry'))
      );
      const active = aoeStunners.length >= 1 && aoeDamagers.length >= 1;
      const participants = Array.from(new Set([...aoeStunners, ...aoeDamagers]));
      return { active, participants };
    },
  },
  {
    id: 'ganking',
    name: 'Combo de Ganking y Cazadores',
    description: 'Iniciadores veloces que aseguran presas para hiper-carries de daño letal.',
    impact: 'Crea espacio en el mapa cazando héroes aislados y asegurando ventaja de oro.',
    detect: (heroes) => {
      const catchHeroes = heroes.filter((h) =>
        ['Spirit Breaker', 'Clockwerk', 'Storm Spirit', 'Batrider', 'Axe', 'Legion Commander', 'Night Stalker', 'Pudge', 'Nyx Assassin', 'Bounty Hunter'].includes(
          h.localized_name
        ) || (h.roles?.includes('Initiator') && h.roles?.includes('Disabler'))
      );
      const highDps = heroes.filter((h) =>
        ['Phantom Assassin', 'Ursa', 'Clinkz', 'Juggernaut', 'Slark', 'Templar Assassin', 'Muerta', 'Bloodseeker'].includes(h.localized_name) ||
        (h.roles?.includes('Carry') && !h.roles?.includes('Support'))
      );
      const active = catchHeroes.length >= 1 && highDps.length >= 1;
      const participants = Array.from(new Set([...catchHeroes, ...highDps]));
      return { active, participants };
    },
  },
  {
    id: 'vision_control',
    name: 'Equipo con Visión y Control',
    description: 'Doble soporte con múltiples herramientas de incapacitación y visión estratégica.',
    impact: 'Control seguro de runas, protección en líneas y respuesta rápida a ganks.',
    detect: (heroes) => {
      const supports = heroes.filter((h) => h.roles?.includes('Support'));
      return { active: supports.length >= 2, participants: supports };
    },
  },
  {
    id: 'durable_sustain',
    name: 'Composición Duradera (Sustain & Tank)',
    description: 'Línea frontal ultra resistente respaldada por curaciones y mitigación.',
    impact: 'Fuerza peleas prolongadas donde el enemigo agota recursos sin concretar bajas.',
    detect: (heroes) => {
      const healers = heroes.filter((h) =>
        ['Dazzle', 'Omniknight', 'Chen', 'Enchantress', 'Abaddon', 'Necrophos', 'Io', 'Witch Doctor', 'Oracle', 'Treant Protector', 'Warlock'].includes(
          h.localized_name
        )
      );
      const tanks = heroes.filter((h) =>
        ['Centaur Warrunner', 'Axe', 'Tidehunter', 'Bristleback', 'Dragon Knight', 'Wraith King', 'Underlord', 'Pudge', 'Primal Beast', 'Mars'].includes(
          h.localized_name
        ) || h.roles?.includes('Durable')
      );
      const active = (healers.length >= 1 && tanks.length >= 1) || (tanks.length >= 2 && healers.length >= 1);
      const participants = Array.from(new Set([...healers, ...tanks]));
      return { active, participants };
    },
  },
  {
    id: 'siege_push',
    name: 'Asedio Rápido y Presión de Torres',
    description: 'Héroes especializados en derribar estructuras rápidamente tras ganar peleas.',
    impact: 'Reduce el mapa enemigo rápidamente forzándolos a defender sin margen de farm.',
    detect: (heroes) => {
      const pushers = heroes.filter((h) =>
        ['Shadow Shaman', 'Leshrac', 'Death Prophet', "Nature's Prophet", 'Pugna', 'Jakiro', 'Terrorblade', 'Dragon Knight', 'Luna', 'Enigma'].includes(
          h.localized_name
        ) || h.roles?.includes('Pusher')
      );
      return { active: pushers.length >= 2, participants: pushers };
    },
  },
  {
    id: 'global_reach',
    name: 'Presencia Global en Todo el Mapa',
    description: 'Habilidades con rango ilimitado para influir en batallas desde cualquier sector.',
    impact: 'Permite a los núcleos farmear con seguridad sabiendo que pueden responder al instante.',
    detect: (heroes) => {
      const globals = heroes.filter((h) =>
        ['Zeus', 'Spectre', "Nature's Prophet", 'Ancient Apparition', 'Silencer', 'Spirit Breaker', 'Invoker', 'Dawnbreaker', 'Io'].includes(
          h.localized_name
        )
      );
      return { active: globals.length >= 2, participants: globals };
    },
  },
];

/* =========================================================================
   Draft Helper Functions
   ========================================================================= */

const loadHeroesFromStorage = (): Hero[] | null => {
  try {
    const raw = localStorage.getItem(HEROES_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp < CACHE_TTL_MS && Array.isArray(data.heroes) && data.heroes.length > 0) {
      return data.heroes;
    }
  } catch (e) {
    console.warn('No se pudo leer la caché de héroes de Dota 2:', e);
  }
  return null;
};

const saveHeroesToStorage = (heroes: Hero[]) => {
  try {
    localStorage.setItem(
      HEROES_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        heroes,
      })
    );
  } catch (e) {
    console.warn('No se pudo guardar la caché de héroes:', e);
  }
};

/* =========================================================================
   Main Component: DraftPage
   ========================================================================= */

export const DraftPage: React.FC = () => {
  // Team slots (5 for Radiant, 5 for Dire)
  const [radiant, setRadiant] = useState<TeamSlot[]>([
    { hero: null },
    { hero: null },
    { hero: null },
    { hero: null },
    { hero: null },
  ]);
  const [dire, setDire] = useState<TeamSlot[]>([
    { hero: null },
    { hero: null },
    { hero: null },
    { hero: null },
    { hero: null },
  ]);

  // All available heroes
  const [heroes, setHeroes] = useState<Hero[]>(() => {
    const cached = loadHeroesFromStorage();
    return cached && cached.length > 0 ? cached : FALLBACK_HEROES;
  });
  const [loadingHeroes, setLoadingHeroes] = useState<boolean>(false);

  // Hero Picker Modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ team: 'radiant' | 'dire'; slotIndex: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attrFilter, setAttrFilter] = useState<'all' | 'str' | 'agi' | 'int' | 'uni'>('all');

  // Fetch heroes from OpenDota API on mount with 24h cache
  useEffect(() => {
    const cached = loadHeroesFromStorage();
    if (cached && cached.length > 0) {
      setHeroes(cached);
      return;
    }

    let isMounted = true;
    setLoadingHeroes(true);

    fetch('https://api.opendota.com/api/constants/heroes')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const list: Hero[] = Array.isArray(data) ? data : Object.values(data);
        if (list && list.length > 0) {
          list.sort((a, b) => (a.localized_name || '').localeCompare(b.localized_name || ''));
          setHeroes(list);
          saveHeroesToStorage(list);
        }
      })
      .catch((err) => {
        console.warn('Fallo al conectar con OpenDota API constants, usando héroes locales:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingHeroes(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pickerOpen) {
        setPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pickerOpen]);

  // Set of picked hero IDs (cannot pick twice)
  const pickedHeroIds = useMemo(() => {
    const ids = new Set<number>();
    radiant.forEach((s) => s.hero && ids.add(s.hero.id));
    dire.forEach((s) => s.hero && ids.add(s.hero.id));
    return ids;
  }, [radiant, dire]);

  // Radiant & Dire non-null heroes
  const activeRadiantHeroes = useMemo(() => radiant.map((s) => s.hero).filter((h): h is Hero => h !== null), [radiant]);
  const activeDireHeroes = useMemo(() => dire.map((s) => s.hero).filter((h): h is Hero => h !== null), [dire]);

  // Filtered heroes in modal
  const filteredPickerHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      // Attribute filter
      if (attrFilter === 'str' && hero.primary_attr !== 'str') return false;
      if (attrFilter === 'agi' && hero.primary_attr !== 'agi') return false;
      if (attrFilter === 'int' && hero.primary_attr !== 'int') return false;
      if (attrFilter === 'uni' && hero.primary_attr !== 'all') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = hero.localized_name.toLowerCase().includes(query);
        const matchesRole = hero.roles?.some((r) => r.toLowerCase().includes(query));
        if (!matchesName && !matchesRole) return false;
      }
      return true;
    });
  }, [heroes, attrFilter, searchQuery]);

  // Open picker for a slot
  const handleOpenPicker = (team: 'radiant' | 'dire', slotIndex: number) => {
    setPickerTarget({ team, slotIndex });
    setSearchQuery('');
    setPickerOpen(true);
  };

  // Select hero into slot
  const handleSelectHero = (hero: Hero) => {
    if (!pickerTarget) return;
    const { team, slotIndex } = pickerTarget;

    if (team === 'radiant') {
      setRadiant((prev) => {
        const next = [...prev];
        next[slotIndex] = { hero };
        return next;
      });
    } else {
      setDire((prev) => {
        const next = [...prev];
        next[slotIndex] = { hero };
        return next;
      });
    }

    setPickerOpen(false);
    setPickerTarget(null);
  };

  // Remove hero from slot
  const handleRemoveHero = (team: 'radiant' | 'dire', slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (team === 'radiant') {
      setRadiant((prev) => {
        const next = [...prev];
        next[slotIndex] = { hero: null };
        return next;
      });
    } else {
      setDire((prev) => {
        const next = [...prev];
        next[slotIndex] = { hero: null };
        return next;
      });
    }
  };

  // Reset entire draft
  const handleResetDraft = () => {
    setRadiant([{ hero: null }, { hero: null }, { hero: null }, { hero: null }, { hero: null }]);
    setDire([{ hero: null }, { hero: null }, { hero: null }, { hero: null }, { hero: null }]);
  };

  // Load a quick example draft for instant evaluation
  const handleLoadSampleDraft = () => {
    const findHero = (name: string) => heroes.find((h) => h.localized_name.toLowerCase() === name.toLowerCase()) || null;

    setRadiant([
      { hero: findHero('Earthshaker') },
      { hero: findHero('Juggernaut') },
      { hero: findHero('Ancient Apparition') },
      { hero: findHero('Centaur Warrunner') },
      { hero: findHero('Invoker') },
    ]);

    setDire([
      { hero: findHero('Huskar') },
      { hero: findHero('Phantom Assassin') },
      { hero: findHero('Lion') },
      { hero: findHero('Tidehunter') },
      { hero: findHero('Zeus') },
    ]);
  };

  // Quick pick counter into Radiant if empty slot exists
  const handleQuickPickForRadiant = (hero: Hero) => {
    const emptyIndex = radiant.findIndex((s) => s.hero === null);
    if (emptyIndex !== -1) {
      setRadiant((prev) => {
        const next = [...prev];
        next[emptyIndex] = { hero };
        return next;
      });
    }
  };

  /* =========================================================================
     Analysis Calculations
     ========================================================================= */

  const isAnalysisActive = activeRadiantHeroes.length > 0 && activeDireHeroes.length > 0;

  // 1. Team Composition Scores (0-10)
  const compositionScores = useMemo(() => {
    const calcScore = (team: Hero[], filter: (h: Hero) => boolean): number => {
      if (team.length === 0) return 0;
      const count = team.filter(filter).length;
      // Formula calibrated for a 5-hero lineup: 1 hero => ~4.5, 2 heroes => ~7.2, 3+ => 9.5+
      const score = Math.min(10, Math.round((count * 2.3 + (count > 0 ? 2 : 0)) * 10) / 10);
      return score;
    };

    return [
      {
        id: 'initiation',
        name: 'Iniciación',
        description: 'Capacidad para sorprender, atrapar enemigos y comenzar batallas en ventaja.',
        icon: Zap,
        radiant: calcScore(activeRadiantHeroes, (h) => h.roles?.includes('Initiator')),
        dire: calcScore(activeDireHeroes, (h) => h.roles?.includes('Initiator')),
      },
      {
        id: 'phys_damage',
        name: 'Daño Físico',
        description: 'Potencial de daño por segundo continuo y letalidad con ataques básicos.',
        icon: Swords,
        radiant: calcScore(
          activeRadiantHeroes,
          (h) => h.roles?.includes('Carry') || (h.attack_type === 'Melee' && h.primary_attr === 'str')
        ),
        dire: calcScore(
          activeDireHeroes,
          (h) => h.roles?.includes('Carry') || (h.attack_type === 'Melee' && h.primary_attr === 'str')
        ),
      },
      {
        id: 'magic_damage',
        name: 'Daño Mágico (Burst)',
        description: 'Ráfagas de daño de hechizos instantáneas para evaporar objetivos frágiles.',
        icon: Flame,
        radiant: calcScore(activeRadiantHeroes, (h) => h.roles?.includes('Nuker')),
        dire: calcScore(activeDireHeroes, (h) => h.roles?.includes('Nuker')),
      },
      {
        id: 'cc',
        name: 'Control de Masas (CC)',
        description: 'Aturdimientos, silencios e inmovilizaciones para neutralizar núcleos rivales.',
        icon: Lock,
        radiant: calcScore(activeRadiantHeroes, (h) => h.roles?.includes('Disabler')),
        dire: calcScore(activeDireHeroes, (h) => h.roles?.includes('Disabler')),
      },
      {
        id: 'utility',
        name: 'Utilidad / Soporte',
        description: 'Visión, auras, salvamentos, escudos y facilitación de objetivos.',
        icon: HeartHandshake,
        radiant: calcScore(activeRadiantHeroes, (h) => h.roles?.includes('Support')),
        dire: calcScore(activeDireHeroes, (h) => h.roles?.includes('Support')),
      },
      {
        id: 'tank',
        name: 'Resistencia (Tanque)',
        description: 'Capacidad para sostener la línea frontal y absorber castigo pesado.',
        icon: Shield,
        radiant: calcScore(activeRadiantHeroes, (h) => h.roles?.includes('Durable')),
        dire: calcScore(activeDireHeroes, (h) => h.roles?.includes('Durable')),
      },
    ];
  }, [activeRadiantHeroes, activeDireHeroes]);

  // 2. Counters Analysis
  const countersAnalysis = useMemo(() => {
    return activeDireHeroes.map((direHero) => {
      const dbEntry = HERO_COUNTERS_DB[direHero.localized_name];

      // Check if radiant has a counter for this hero
      let neutralizedBy: { hero: Hero; reason: string } | null = null;

      if (dbEntry) {
        for (const ally of activeRadiantHeroes) {
          const match = dbEntry.counteredBy.find(
            (c) => c.name.toLowerCase() === ally.localized_name.toLowerCase()
          );
          if (match) {
            neutralizedBy = { hero: ally, reason: match.reason };
            break;
          }
        }
      }

      // If not neutralized, suggest 2-3 heroes
      const suggestedPicks: Array<{ hero: Hero; reason: string }> = [];
      if (!neutralizedBy) {
        if (dbEntry && dbEntry.counteredBy) {
          for (const item of dbEntry.counteredBy) {
            // Check if already drafted anywhere
            const cand = heroes.find(
              (h) => h.localized_name.toLowerCase() === item.name.toLowerCase()
            );
            if (cand && !pickedHeroIds.has(cand.id)) {
              suggestedPicks.push({ hero: cand, reason: item.reason });
              if (suggestedPicks.length >= 3) break;
            }
          }
        }

        // Generic fallback suggestions based on roles if DB had no matches
        if (suggestedPicks.length === 0) {
          if (direHero.roles?.includes('Nuker')) {
            const am = heroes.find((h) => h.localized_name === 'Anti-Mage' && !pickedHeroIds.has(h.id));
            if (am) suggestedPicks.push({ hero: am, reason: 'Gran resistencia innata y castigo con Mana Void.' });
            const sil = heroes.find((h) => h.localized_name === 'Silencer' && !pickedHeroIds.has(h.id));
            if (sil) suggestedPicks.push({ hero: sil, reason: 'Silencio global desactiva sus hechizos en peleas.' });
          } else if (direHero.roles?.includes('Carry')) {
            const axe = heroes.find((h) => h.localized_name === 'Axe' && !pickedHeroIds.has(h.id));
            if (axe) suggestedPicks.push({ hero: axe, reason: 'Control perforador de BKB y daño con giros.' });
            const lion = heroes.find((h) => h.localized_name === 'Lion' && !pickedHeroIds.has(h.id));
            if (lion) suggestedPicks.push({ hero: lion, reason: 'Hex instantáneo para aislarlo y destruirlo.' });
          } else {
            const slark = heroes.find((h) => h.localized_name === 'Slark' && !pickedHeroIds.has(h.id));
            if (slark) suggestedPicks.push({ hero: slark, reason: 'Robo continuo de estadísticas y purga Dark Pact.' });
          }
        }
      }

      return {
        enemy: direHero,
        neutralizedBy,
        suggestedPicks,
      };
    });
  }, [activeDireHeroes, activeRadiantHeroes, heroes, pickedHeroIds]);

  // 3. Detected Synergies in Radiant
  const detectedSynergies = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      description: string;
      impact: string;
      participants: Hero[];
    }> = [];

    for (const syn of SYNERGY_DEFINITIONS) {
      const res = syn.detect(activeRadiantHeroes);
      if (res.active) {
        list.push({
          id: syn.id,
          name: syn.name,
          description: syn.description,
          impact: syn.impact,
          participants: res.participants,
        });
      }
    }
    return list;
  }, [activeRadiantHeroes]);

  // 4. Tactical Warnings
  const warnings = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      severity: 'critical' | 'high' | 'moderate' | 'info';
    }> = [];

    if (activeRadiantHeroes.length === 0) return list;

    // Check Initiators
    const initiators = activeRadiantHeroes.filter((h) => h.roles?.includes('Initiator'));
    if (initiators.length === 0 && activeRadiantHeroes.length >= 2) {
      list.push({
        id: 'no_initiator',
        title: 'Sin iniciador — difícil empezar peleas',
        description:
          'Tu equipo no tiene herramientas de salto o agarre para forzar batallas favorables. Dependerán de responder a los ataques rivales.',
        severity: 'critical',
      });
    }

    // Check Supports
    const supports = activeRadiantHeroes.filter((h) => h.roles?.includes('Support'));
    if (supports.length === 0 && activeRadiantHeroes.length >= 2) {
      list.push({
        id: 'no_support',
        title: 'Sin soporte — poca curación y visión',
        description:
          'Carencia grave de visión en el mapa, compras de centinelas y protección en líneas en los primeros 10 minutos.',
        severity: 'critical',
      });
    }

    // Check All Carries
    const carries = activeRadiantHeroes.filter((h) => h.roles?.includes('Carry'));
    if (carries.length >= 4) {
      list.push({
        id: 'too_many_carries',
        title: 'Demasiado enfocado en carry — vulnerable al early game',
        description:
          'No habrá suficiente oro de jungla y líneas para todos los núcleos. Un equipo coordinado los aplastará antes del minuto 20.',
        severity: 'high',
      });
    }

    // Check Magic Burst vs lack of BKB / magic resistance
    const direNukers = activeDireHeroes.filter((h) => h.roles?.includes('Nuker'));
    const radiantTanks = activeRadiantHeroes.filter(
      (h) => h.roles?.includes('Durable') || h.localized_name === 'Anti-Mage'
    );
    if (direNukers.length >= 2 && radiantTanks.length === 0 && activeRadiantHeroes.length >= 3) {
      list.push({
        id: 'magic_vulnerability',
        title: 'Vulnerabilidad a daño mágico masivo',
        description:
          'Dire cuenta con alto daño explosivo en sus hechizos. Tus núcleos necesitarán priorizar Black King Bar y tus apoyos un Pipe of Insight.',
        severity: 'moderate',
      });
    }

    // Check CC Disablers
    const disablers = activeRadiantHeroes.filter((h) => h.roles?.includes('Disabler'));
    if (disablers.length === 0 && activeRadiantHeroes.length >= 3) {
      list.push({
        id: 'no_disablers',
        title: 'Falta de Control de Masas (CC)',
        description:
          'Sin aturdimientos o silencios, los héroes escurridizos enemigos podrán escapar libremente y cancelar peleas con teletransportación.',
        severity: 'high',
      });
    }

    // Check Durable / Frontline
    const durable = activeRadiantHeroes.filter((h) => h.roles?.includes('Durable'));
    if (durable.length === 0 && activeRadiantHeroes.length >= 3) {
      list.push({
        id: 'no_frontline',
        title: 'Falta de línea frontal sólida',
        description:
          'Ningún héroe tiene la resistencia natural para absorber el daño inicial. Los aliados frágiles estarán expuestos a emboscadas directas.',
        severity: 'moderate',
      });
    }

    return list;
  }, [activeRadiantHeroes, activeDireHeroes]);

  // 5. Draft Score (0 - 100)
  const draftScoreData = useMemo(() => {
    if (!isAnalysisActive) {
      return { score: 50, label: 'En Espera', color: 'text-gray-400', barBg: 'bg-gray-600', advice: '' };
    }

    let score = 50;

    // Role completeness bonus (up to +25)
    const hasInitiator = activeRadiantHeroes.some((h) => h.roles?.includes('Initiator'));
    const hasSupport = activeRadiantHeroes.some((h) => h.roles?.includes('Support'));
    const hasCarry = activeRadiantHeroes.some((h) => h.roles?.includes('Carry'));
    const hasDurable = activeRadiantHeroes.some((h) => h.roles?.includes('Durable'));
    const hasDisabler = activeRadiantHeroes.some((h) => h.roles?.includes('Disabler'));

    if (hasInitiator) score += 6;
    if (hasSupport) score += 6;
    if (hasCarry) score += 6;
    if (hasDurable) score += 4;
    if (hasDisabler) score += 5;

    // Synergies bonus (+5 each, up to +20)
    score += Math.min(20, detectedSynergies.length * 6);

    // Counter advantage (+6 per neutralized enemy, -4 per uncountered enemy)
    const neutralizedCount = countersAnalysis.filter((c) => c.neutralizedBy !== null).length;
    const uncounteredCount = countersAnalysis.filter((c) => c.neutralizedBy === null).length;
    score += neutralizedCount * 5;
    score -= uncounteredCount * 3;

    // Warning penalties
    warnings.forEach((w) => {
      if (w.severity === 'critical') score -= 10;
      else if (w.severity === 'high') score -= 6;
      else if (w.severity === 'moderate') score -= 3;
    });

    // Clamp score
    score = Math.max(15, Math.min(96, score));

    let label = 'Equilibrado';
    let color = 'text-sky-400';
    let barBg = 'bg-sky-500';
    let advice = 'Composición sólida con posibilidades balanceadas. El resultado dependerá de la ejecución de las peleas.';

    if (score < 40) {
      label = 'Muy Débil';
      color = 'text-rose-500';
      barBg = 'bg-rose-500';
      advice = 'El draft presenta deficiencias estructurales graves en roles clave o counters. Riesgo alto de perder líneas tempranas.';
    } else if (score < 56) {
      label = 'Regular';
      color = 'text-amber-400';
      barBg = 'bg-amber-500';
      advice = 'Existen desventajas tácticas frente al rival. Requerirán jugar en torno a sus pocos picos de poder.';
    } else if (score < 75) {
      label = 'Equilibrado';
      color = 'text-cyan-400';
      barBg = 'bg-cyan-500';
      advice = 'Buen reparto de tareas y control. Mantengan visión constante en Roshan y aseguren las líneas.';
    } else if (score < 88) {
      label = 'Fuerte';
      color = 'text-emerald-400';
      barBg = 'bg-emerald-500';
      advice = 'Ventaja táctica clara. Sus sinergias neutralizan eficientemente los núcleos enemigos.';
    } else {
      label = 'Dominante';
      color = 'text-purple-400';
      barBg = 'bg-gradient-to-r from-emerald-400 to-purple-500';
      advice = 'Draft de calibre competitivo superior. Tienen respuestas directas para todas las amenazas del rival.';
    }

    return { score, label, color, barBg, advice };
  }, [isAnalysisActive, activeRadiantHeroes, detectedSynergies, countersAnalysis, warnings]);

  /* =========================================================================
     Render UI
     ========================================================================= */

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-rose-500/20 border border-slate-700/80 shadow-lg">
              <Swords className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Asistente de Draft <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-mono font-medium">En Vivo</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                Simulador interactivo con análisis de sinergias, counters y balance competitivo para Dota 2
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLoadSampleDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-gray-200 transition shadow-sm hover:border-slate-600"
            title="Cargar una partida típica con sinergias y counters para demostración"
          >
            <Sparkle className="w-3.5 h-3.5 text-amber-400" />
            <span>Draft de Ejemplo</span>
          </button>

          <button
            onClick={handleResetDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700/60 text-xs font-semibold text-gray-300 hover:text-rose-300 transition shadow-sm"
            title="Reiniciar ambos equipos a estado vacío"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar Todo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
         Top Section: Draft Board (Radiant vs Dire)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RADIANT BOARD */}
        <div className="bg-gradient-to-b from-emerald-950/30 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          {/* Team Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500/50 animate-pulse" />
              <div>
                <h2 className="text-lg font-bold text-emerald-400 tracking-wide flex items-center gap-2">
                  Radiant <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 font-medium text-emerald-300">Tu Equipo</span>
                </h2>
                <p className="text-[11px] text-gray-400">
                  {activeRadiantHeroes.length} de 5 héroes elegidos
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              Aliados
            </div>
          </div>

          {/* 5 Slots */}
          <div className="space-y-2.5">
            {radiant.map((slot, index) => {
              const isFilled = slot.hero !== null;
              const hero = slot.hero;
              const imgUrl = getHeroImageUrl(hero);

              return (
                <div
                  key={`radiant-${index}`}
                  onClick={() => handleOpenPicker('radiant', index)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400 shadow-lg'
                      : 'bg-slate-950/60 border-dashed border-emerald-600/30 hover:border-emerald-400/80 hover:bg-emerald-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Slot Indicator */}
                    <span className="w-5 text-center text-xs font-mono font-bold text-emerald-500/80">
                      #{index + 1}
                    </span>

                    {/* Hero Thumbnail / Placeholder */}
                    {isFilled && hero ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-emerald-500/50 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <img
                          src={imgUrl}
                          alt={hero.localized_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if steam CDN fails
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-emerald-900/30 group-hover:border-emerald-400/50 transition">
                        <Plus className="w-6 h-6 text-emerald-400/70 group-hover:text-emerald-300 group-hover:scale-110 transition-transform" />
                      </div>
                    )}

                    {/* Details */}
                    {isFilled && hero ? (
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm md:text-base truncate group-hover:text-emerald-300 transition">
                            {hero.localized_name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              hero.primary_attr === 'str'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : hero.primary_attr === 'agi'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : hero.primary_attr === 'int'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {hero.primary_attr === 'all' ? 'UNI' : hero.primary_attr}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {hero.roles?.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-emerald-300/80 group-hover:text-emerald-200 transition">
                          Seleccionar Héroe
                        </p>
                        <p className="text-xs text-gray-500">
                          Haz clic para elegir aliado {index + 1}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  {isFilled && (
                    <button
                      onClick={(e) => handleRemoveHero('radiant', index, e)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-rose-600/30 transition border border-transparent hover:border-rose-500/40"
                      title="Eliminar héroe del slot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DIRE BOARD */}
        <div className="bg-gradient-to-b from-rose-950/30 via-slate-900/90 to-slate-950 border border-rose-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-600" />

          {/* Team Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-pulse" />
              <div>
                <h2 className="text-lg font-bold text-rose-400 tracking-wide flex items-center gap-2">
                  Dire <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 font-medium text-rose-300">Enemigos</span>
                </h2>
                <p className="text-[11px] text-gray-400">
                  {activeDireHeroes.length} de 5 héroes elegidos
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300">
              Rivales
            </div>
          </div>

          {/* 5 Slots */}
          <div className="space-y-2.5">
            {dire.map((slot, index) => {
              const isFilled = slot.hero !== null;
              const hero = slot.hero;
              const imgUrl = getHeroImageUrl(hero);

              return (
                <div
                  key={`dire-${index}`}
                  onClick={() => handleOpenPicker('dire', index)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-slate-900/90 border-rose-500/40 hover:border-rose-400 shadow-lg'
                      : 'bg-slate-950/60 border-dashed border-rose-600/30 hover:border-rose-400/80 hover:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Slot Indicator */}
                    <span className="w-5 text-center text-xs font-mono font-bold text-rose-500/80">
                      #{index + 1}
                    </span>

                    {/* Hero Thumbnail / Placeholder */}
                    {isFilled && hero ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-rose-500/50 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <img
                          src={imgUrl}
                          alt={hero.localized_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-900/80 border border-rose-500/20 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-rose-900/30 group-hover:border-rose-400/50 transition">
                        <Plus className="w-6 h-6 text-rose-400/70 group-hover:text-rose-300 group-hover:scale-110 transition-transform" />
                      </div>
                    )}

                    {/* Details */}
                    {isFilled && hero ? (
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm md:text-base truncate group-hover:text-rose-300 transition">
                            {hero.localized_name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              hero.primary_attr === 'str'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : hero.primary_attr === 'agi'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : hero.primary_attr === 'int'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {hero.primary_attr === 'all' ? 'UNI' : hero.primary_attr}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {hero.roles?.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-rose-300/80 group-hover:text-rose-200 transition">
                          Seleccionar Héroe
                        </p>
                        <p className="text-xs text-gray-500">
                          Haz clic para elegir enemigo {index + 1}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  {isFilled && (
                    <button
                      onClick={(e) => handleRemoveHero('dire', index, e)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-rose-600/30 transition border border-transparent hover:border-rose-500/40"
                      title="Eliminar héroe del slot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
         Bottom Section: Analysis (Shown after at least 1 hero per team)
         ========================================================================= */}
      {!isAnalysisActive ? (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-2xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Configura el Asistente Táctico
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Selecciona al menos <strong className="text-emerald-400">1 héroe para Radiant</strong> y{' '}
            <strong className="text-rose-400">1 héroe para Dire</strong> para activar la comparativa de composición,
            counters sugeridos, sinergias y el puntaje integral de draft en tiempo real.
          </p>
          <button
            onClick={handleLoadSampleDraft}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition transform hover:-translate-y-0.5"
          >
            <Sparkle className="w-4 h-4" />
            <span>Cargar Partida de Ejemplo para Probar</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* 5. Draft Score Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-gray-400 font-semibold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Calidad Integral de Draft
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {draftScoreData.score}
                    <span className="text-sm text-gray-500 font-normal"> / 100</span>
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 ${draftScoreData.color}`}
                  >
                    Draft {draftScoreData.label}
                  </span>
                </div>
              </div>

              <div className="text-xs md:text-right text-gray-400 max-w-md">
                <p className="leading-relaxed">{draftScoreData.advice}</p>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${draftScoreData.barBg}`}
                style={{ width: `${draftScoreData.score}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2 px-1">
              <span>Muy Débil (0)</span>
              <span>Regular (40)</span>
              <span>Equilibrado (60)</span>
              <span>Fuerte (80)</span>
              <span>Dominante (100)</span>
            </div>
          </div>

          {/* 1. Composición de Equipo — Comparative Bars */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Composición de Equipo — Comparativa de Atributos
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comparación táctica de fortalezas en escala 0 a 10 entre Radiant y Dire
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Radiant
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Dire
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compositionScores.map((metric) => {
                const Icon = metric.icon;
                const radiantPct = Math.round((metric.radiant / 10) * 100);
                const direPct = Math.round((metric.dire / 10) * 100);
                const diff = Math.round((metric.radiant - metric.dire) * 10) / 10;

                return (
                  <div
                    key={metric.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-300">
                          <Icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-200">{metric.name}</span>
                      </div>

                      <div className="text-xs font-mono font-bold">
                        {diff > 0 ? (
                          <span className="text-emerald-400">+{diff} Radiant</span>
                        ) : diff < 0 ? (
                          <span className="text-rose-400">+{Math.abs(diff)} Dire</span>
                        ) : (
                          <span className="text-gray-400">Equilibrado</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mb-3 leading-tight">
                      {metric.description}
                    </p>

                    {/* Radiant Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-medium">Radiant</span>
                        <span className="font-mono text-emerald-300 font-bold">{metric.radiant} / 10</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${radiantPct}%` }}
                        />
                      </div>

                      {/* Dire Bar */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-rose-400 font-medium">Dire</span>
                        <span className="font-mono text-rose-300 font-bold">{metric.dire} / 10</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${direPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Counters Sugeridos */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-400" />
                  Análisis de Counters y Respuestas Tácticas
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Estado de neutralización frente a cada héroe enemigo y sugerencias para los slots vacíos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {countersAnalysis.map(({ enemy, neutralizedBy, suggestedPicks }) => {
                const enemyImg = getHeroImageUrl(enemy);

                return (
                  <div
                    key={enemy.id}
                    className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Enemy Info */}
                    <div className="flex items-center gap-3.5 min-w-[200px]">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-rose-500/40 flex-shrink-0 shadow">
                        <img
                          src={enemyImg}
                          alt={enemy.localized_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{enemy.localized_name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Enemigo
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {enemy.roles?.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                    </div>

                    {/* Status & Matchup Outcome */}
                    <div className="flex-1 md:px-4">
                      {neutralizedBy ? (
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-300">
                                Neutralizado por {neutralizedBy.hero.localized_name}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                Counter Activo
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                              {neutralizedBy.reason}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-amber-300">
                              Amenaza activa sin counter directo en tu alineación
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Este enemigo gozará de mayor libertad. Te sugerimos los siguientes héroes disponibles:
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggested Picks (If uncountered) */}
                    {!neutralizedBy && suggestedPicks.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap md:max-w-xs">
                        {suggestedPicks.map((pick) => {
                          const pickImg = getHeroImageUrl(pick.hero);
                          const canQuickPick = radiant.some((s) => s.hero === null);

                          return (
                            <div
                              key={pick.hero.id}
                              className="group relative flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 transition shadow-sm"
                              title={pick.reason}
                            >
                              <img
                                src={pickImg}
                                alt={pick.hero.localized_name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-600"
                              />
                              <div className="text-left">
                                <span className="text-xs font-bold text-gray-200 block truncate max-w-[90px]">
                                  {pick.hero.localized_name}
                                </span>
                                {canQuickPick && (
                                  <button
                                    onClick={() => handleQuickPickForRadiant(pick.hero)}
                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
                                  >
                                    <span>+ Elegir</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Sinergias Detectadas */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Sinergias Detectadas en Radiant
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Combinaciones y combos tácticos activos entre tus selecciones
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                {detectedSynergies.length} Sinergia{detectedSynergies.length !== 1 ? 's' : ''} Activa{detectedSynergies.length !== 1 ? 's' : ''}
              </span>
            </div>

            {detectedSynergies.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <p className="text-xs text-gray-400">
                  Aún no se han detectado combinaciones clave. Incorpora combinaciones de aturdimiento en área + daño de ráfaga, o iniciadores con carries de alto DPS.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectedSynergies.map((syn) => (
                  <div
                    key={syn.id}
                    className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-400/60 transition shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                        <Sparkle className="w-4 h-4 text-emerald-400" />
                        {syn.name}
                      </h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Activa
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                      {syn.description}
                    </p>

                    {/* Participants Mini-Avatars */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        Héroes:
                      </span>
                      {syn.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/80"
                        >
                          <img
                            src={getHeroImageUrl(p)}
                            alt={p.localized_name}
                            className="w-4 h-4 rounded object-cover"
                          />
                          <span className="text-xs text-gray-200 font-medium">
                            {p.localized_name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{syn.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Advertencias Tácticas */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Advertencias y Vulnerabilidades
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Riesgos detectados en tu composición que los rivales podrían explotar
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-gray-300">
                {warnings.length} Alerta{warnings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {warnings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">
                  ¡Excelente equilibrio! No se detectaron vulnerabilidades críticas en la alineación de Radiant.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {warnings.map((warn) => {
                  const isCritical = warn.severity === 'critical';
                  const isHigh = warn.severity === 'high';

                  return (
                    <div
                      key={warn.id}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 transition ${
                        isCritical
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          : isHigh
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950/80 border-slate-800 text-gray-300'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isCritical
                            ? 'text-rose-400'
                            : isHigh
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{warn.title}</h4>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              isCritical
                                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                                : isHigh
                                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-gray-400'
                            }`}
                          >
                            {warn.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {warn.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
         Hero Picker Modal
         ========================================================================= */}
      {pickerOpen && pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    pickerTarget.team === 'radiant' ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Seleccionar Héroe para{' '}
                    <span
                      className={
                        pickerTarget.team === 'radiant' ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      {pickerTarget.team === 'radiant' ? 'Radiant (Aliados)' : 'Dire (Enemigos)'}
                    </span>{' '}
                    — Slot #{pickerTarget.slotIndex + 1}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Filtra por nombre, rol o atributo principal para tu estrategia
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPickerOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 md:px-6 bg-slate-900/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o rol..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Attribute Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setAttrFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    attrFilter === 'all'
                      ? 'bg-slate-700 text-white shadow'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setAttrFilter('str')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    attrFilter === 'str'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow'
                      : 'text-gray-400 hover:text-red-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  STR
                </button>
                <button
                  onClick={() => setAttrFilter('agi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    attrFilter === 'agi'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow'
                      : 'text-gray-400 hover:text-emerald-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  AGI
                </button>
                <button
                  onClick={() => setAttrFilter('int')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    attrFilter === 'int'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow'
                      : 'text-gray-400 hover:text-sky-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  INT
                </button>
                <button
                  onClick={() => setAttrFilter('uni')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    attrFilter === 'uni'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                      : 'text-gray-400 hover:text-purple-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  UNI
                </button>
              </div>
            </div>

            {/* Heroes Grid */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-800">
              {filteredPickerHeroes.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-sm">
                  No se encontraron héroes con el filtro actual.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredPickerHeroes.map((hero) => {
                    const isAlreadyPicked = pickedHeroIds.has(hero.id);
                    const heroImg = getHeroImageUrl(hero);

                    return (
                      <button
                        key={hero.id}
                        disabled={isAlreadyPicked}
                        onClick={() => handleSelectHero(hero)}
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center justify-center ${
                          isAlreadyPicked
                            ? 'opacity-30 bg-slate-950 border-slate-800/60 cursor-not-allowed'
                            : pickerTarget.team === 'radiant'
                            ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-400 hover:bg-emerald-950/20 hover:scale-[1.02] shadow-md'
                            : 'bg-slate-900/70 border-slate-800 hover:border-rose-400 hover:bg-rose-950/20 hover:scale-[1.02] shadow-md'
                        }`}
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/60 mb-2 flex-shrink-0 shadow">
                          <img
                            src={heroImg}
                            alt={hero.localized_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>

                        <span className="text-xs font-bold text-gray-200 text-center truncate w-full group-hover:text-white transition">
                          {hero.localized_name}
                        </span>

                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              hero.primary_attr === 'str'
                                ? 'text-red-400 bg-red-500/10'
                                : hero.primary_attr === 'agi'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : hero.primary_attr === 'int'
                                ? 'text-sky-400 bg-sky-500/10'
                                : 'text-purple-300 bg-purple-500/10'
                            }`}
                          >
                            {hero.primary_attr === 'all' ? 'UNI' : hero.primary_attr}
                          </span>
                        </div>

                        {isAlreadyPicked && (
                          <span className="absolute inset-x-0 bottom-1 text-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            Seleccionado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 md:px-6 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
              <span>{filteredPickerHeroes.length} héroes disponibles</span>
              <button
                onClick={() => setPickerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-medium transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPage;

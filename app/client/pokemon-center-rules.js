import { ItemCategory, ItemSubcategory, itemCanTriggerEvolution, pokemonCanHoldItem } from "../data/items.js";
import { maxHpForLevel } from "../data/index.js";
import * as Engine from "../engine/index.js";

export function pokemonCenterLimit(pokemon, catalogLimit) {
  return pokemon && pokemon.debugCreated ? 999 : catalogLimit;
}

export function pokemonCenterMode(scene) {
  var mode = scene && scene.centerMode;
  return ["assign-held", "use-item", "use-mt"].indexOf(mode) !== -1 ? mode : "assign-held";
}

export function pokemonCenterModeConfig(mode) {
  if (mode === "use-item") {
    return {
      pokemonTitle: "Pokemon su cui usare lo strumento",
      emptyText: "Nessuno strumento utilizzabile disponibile.",
      itemFilter: function (item) {
        return itemCanTriggerEvolution(item) || item.category === ItemCategory.Vitamin
          || item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.MoveTutor;
      }
    };
  }
  if (mode === "use-mt") {
    return {
      pokemonTitle: "Pokemon su cui usare la MT",
      emptyText: "Nessuna MT disponibile.",
      itemFilter: function (item) { return item.category === ItemCategory.Mt; }
    };
  }
  return {
    pokemonTitle: "Pokemon a cui assegnare lo strumento",
    emptyText: "Nessuno strumento assegnabile disponibile.",
    itemFilter: function (item) { return item.category === ItemCategory.HeldItem || item.category === ItemCategory.Berry; }
  };
}

export function pokemonCenterTargetMode(scene, mode, item) {
  var pendingAction = scene && scene.pendingAction;
  if (pendingAction && (pendingAction.type === "replace-mt-move" || pendingAction.type === "replace-tutor-move")) {
    return "forget-move";
  }
  if (!item) {
    return "none";
  }
  if (mode === "assign-held") {
    return item.category === ItemCategory.HeldItem || item.category === ItemCategory.Berry ? "pokemon" : "none";
  }
  if (mode === "use-item") {
    if (item.category === ItemCategory.Vitamin) {
      return item.effect === "move_power" ? "move" : (item.effect === "max_hp" ? "pokemon" : "none");
    }
    if (itemCanTriggerEvolution(item)) {
      return "compatible-pokemon";
    }
    if (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.MoveTutor) {
      return pendingAction && pendingAction.type === "choose-tutor-move" ? "tutor-move" : "compatible-pokemon";
    }
  }
  if (mode === "use-mt") {
    return item.category === ItemCategory.Mt ? "compatible-pokemon" : "none";
  }
  return "none";
}

export function pokemonCenterPokemonMatchesItem(mode, item, pokemon, compatibility) {
  compatibility = compatibility || {};
  if (!item || !pokemon) {
    return false;
  }
  if (mode === "assign-held") {
    return pokemonCanHoldItem(pokemon, item);
  }
  if (mode === "use-item") {
    if (item.category === ItemCategory.Vitamin) {
      return item.effect === "max_hp" && Number(pokemon.maxHp) < pokemonCenterLimit(pokemon, maxHpForLevel(pokemon.level));
    }
    if (item.category === ItemCategory.Item && item.subcategory === ItemSubcategory.MoveTutor) {
      return Engine.pokemonMoveTutorPool(pokemon).length > 0;
    }
    return Boolean(compatibility.hasItemEvolution);
  }
  if (mode === "use-mt") {
    return Boolean(compatibility.canLearnMt);
  }
  return false;
}

export function pokemonCenterMoveMatchesItem(scene, mode, item, pokemon, pokemonIndex, move) {
  var targetMode = pokemonCenterTargetMode(scene, mode, item);
  if (targetMode === "forget-move") {
    return Boolean(
      pokemon
        && move
        && scene
        && scene.pendingAction
        && Number(scene.pendingAction.pokemonIndex) === Number(pokemonIndex)
    );
  }
  return Boolean(
    targetMode === "move" && item && pokemon && move && item.category === ItemCategory.Vitamin && item.effect === "move_power"
      && (Number(move.power) < pokemonCenterLimit(pokemon, Engine.powerForLevel(pokemon.level))
        || Number(move.stats) < pokemonCenterLimit(pokemon, Engine.statsForLevel(pokemon.level)))
  );
}

export function pokemonCenterPokemonDisplayState(scene, mode, item, pokemon, pokemonIndex, compatibility) {
  var targetMode = pokemonCenterTargetMode(scene, mode, item);
  var compatible = pokemonCenterPokemonMatchesItem(mode, item, pokemon, compatibility);
  var forgetPokemonIndex = scene && scene.pendingAction ? Number(scene.pendingAction.pokemonIndex) : NaN;
  if (targetMode === "none") {
    return { clickable: false, muted: false, bodyMuted: false };
  }
  if (targetMode === "pokemon") {
    return { clickable: compatible, muted: !compatible, bodyMuted: false };
  }
  if (targetMode === "move") {
    return { clickable: false, muted: false, bodyMuted: true };
  }
  if (targetMode === "tutor-move") {
    return { clickable: false, muted: Number(pokemonIndex) !== forgetPokemonIndex, bodyMuted: false };
  }
  if (targetMode === "forget-move") {
    return {
      clickable: false,
      muted: Number(pokemonIndex) !== forgetPokemonIndex,
      bodyMuted: Number(pokemonIndex) === forgetPokemonIndex
    };
  }
  return { clickable: compatible, muted: !compatible, bodyMuted: false };
}

export function pokemonCenterItemPrompt(mode, item, scene) {
  if (mode === "assign-held") {
    return "A chi vuoi assegnare " + item.name + "?";
  }
  if (mode === "use-item" && item.category === ItemCategory.Vitamin && item.effect === "move_power") {
    return "Su quale mossa vuoi usare " + item.name + "?";
  }
  if (mode === "use-mt") {
    return "A chi vuoi insegnare " + item.name + "?";
  }
  return "Su chi vuoi usare " + item.name + "?";
}

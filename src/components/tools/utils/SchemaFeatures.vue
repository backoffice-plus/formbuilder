<template>

  <span class="f" :title="feature.hoverLabel" v-for="feature in features">{{ feature.value }}</span>
  <!--  <span class="f" :title="JSON.stringify(tool.schema )" >?</span>-->

</template>


<style scoped>
.f {
  background-color: var(--toolItem-icon);
  color: var(--base-100);
  @apply
  block h-3.5 w-3.5 aspect-square
  font-mono text-xs
  rounded-full
  flex items-center justify-center
  cursor-help
}
</style>

<script setup lang="ts">
import {computed} from 'vue'
import {ToolInterface} from "../../../lib/models";
import {isNotEmpty} from "../../../lib/schemaUtil";
import {schemaKeys as conditionalSchemaKeys} from "../../../lib/tools/subschemas/conditional";
import {schemaKeys as validationSchemaKeys} from "../../../lib/tools/subschemas/validation";
import {schemaKeys as compositionSchemaKeys} from "../../../lib/tools/subschemas/composition";

type SchemaFeature = {
  value: string,
  hoverLabel: string,
  schemaKeys: string[],
};
type UischemaFeature = {
  value: string,
  hoverLabel: string,
  uischemaKeys: string[],
};
type Feature = SchemaFeature|UischemaFeature


const props = defineProps<{
  tool: ToolInterface
}>()

const featuresAll:Feature[] = [
  /**
   * SCHEMA
   */
  {
    value: "D",
    hoverLabel: "has Definitions",
    schemaKeys: ["definitions", "$defs"],
  },
  {
    value: "C",
    hoverLabel: "has Conditionals",
    schemaKeys: [...conditionalSchemaKeys, ...compositionSchemaKeys]
  },
  {
    value: "V",
    hoverLabel: "has Validations",
    schemaKeys: validationSchemaKeys,
  },
  {
    value: "+",
    hoverLabel: "has Additional Properties",
    schemaKeys: ["additionalProperties"],
  },

  /**
   * UI SCHEMA
   */
  {
    value: "R",
    hoverLabel: "has Rules",
    uischemaKeys: ["rule"],
  },
  {
    value: "O",
    hoverLabel: "has Options",
    uischemaKeys: ["options"],
  },
  // {
  //   value: "L",
  //   hoverLabel: "has Detail Layout",
  //   uischemaKeys: [],
  // },
];


const features = computed(() => {
  const schemaKeys = Array.from(Object.keys(props.tool.schema ?? {})).filter(name => isNotEmpty((props.tool?.schema as any)[name]));
  const uischemaKeys = Array.from(Object.keys(props.tool.uischema ?? {})).filter(name => isNotEmpty(props.tool?.uischema[name]));

  const hasFeature = (keysExists: string[], keysFound: string[]) => keysExists?.find(x => keysFound.includes(x));

  const hasScope = !!props.tool?.uischema?.scope

  return featuresAll.filter(feature => {
    if ("schemaKeys" in feature && hasScope && hasFeature(feature?.schemaKeys ?? [], schemaKeys)) return true;
    if ("uischemaKeys" in feature && hasFeature(feature?.uischemaKeys ?? [], uischemaKeys)) return true;
  })
})


</script>

<template>

  <div :class="input.styles.arrayList.root" v-if="control.visible">

      <div :class="input.styles.arrayList.itemToolbar">

        <label class="flex-grow">{{ computedLabel }}</label>

        <button
            :class="input.styles.arrayList.addButton"
            :disabled="
                  !control.enabled ||
                  (input.appliedOptions.restrict && arraySchema?.maxItems !== undefined && dataLength >= arraySchema.maxItems)
                "
            @click="addButtonClick"
        >
          +
        </button>
    </div>


      <table :class="{withSortButtons:input.appliedOptions.showSortButtons}">
        <thead v-if="control.schema.type === 'object'">
        <tr>
          <th
              v-for="(prop, index) in getValidColumnProps(control.schema)"
              :key="`${control.path}-header-${index}`"
              scope="col"
          >
            {{ title(prop) }}
          </th>
          <th
              v-if="control.enabled"
              scope="col"
          />
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="(element, index) in control.data"
            :key="`${control.path}-${index}`"
            :class="input.styles.arrayList.item"
        >
          <td
              v-for="propName in getValidColumnProps(control.schema)"
              :key="composePaths(composePaths(control.path, `${index}`), propName)"
          >
            <dispatch-renderer
                :schema="control.schema"
                :uischema="resolveUiSchema(propName)"
                :path="composePaths(control.path, `${index}`)"
                :enabled="control.enabled"
                :renderers="control.renderers"
                :cells="control.cells"
            />
          </td>

          <td v-if="control.enabled">
            <button
                :class="input.styles.arrayList.itemMoveUp"
                :disabled="index <= 0 || !control.enabled"
                @click="moveUpClick($event, index)"
                v-text="'up'"
                v-if="input.appliedOptions.showSortButtons"
            />
            <button
                :class="input.styles.arrayList.itemMoveUp"
                :disabled="index >= dataLength - 1 || !control.enabled"
                @click="moveDownClick($event, index)"
                v-text="'down'"
                v-if="input.appliedOptions.showSortButtons"
            />
            <button
                :class="input.styles.arrayList.itemDelete"
                :disabled="!control.enabled || (input.appliedOptions.restrict &&  arraySchema?.minItems !== undefined && dataLength <= arraySchema.minItems)                    "
                @click="removeItemsClick($event, [index])"
            />
          </td>

        </tr>
        </tbody>

      </table>

      <div v-if="!dataLength" :class="input.styles.arrayList.noData">
        No data
      </div>

      <div :class="input.styles.control.error"
           v-if="control.childErrors.length > 0">
        <span
            v-text="control.childErrors.length +' Errors'"
        />
      </div>

  </div>

</template>


<script setup lang="ts">
import type {ControlElement, JsonSchema} from '@jsonforms/core';
import {composePaths, computeLabel, createDefaultValue, Resolve} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsArrayControl} from '@jsonforms/vue';
import {useVanillaArrayControl, useVanillaControl} from "@jsonforms/vue-vanilla";
import _ from "lodash";
import {computed} from "vue";

/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ArrayControlRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useVanillaArrayControl(useJsonFormsArrayControl(props)) as any) as any;
const control = input.control;


const arraySchema = computed((): JsonSchema | undefined => {
  return Resolve.schema(
      input.control.value.rootSchema,
      input.control.value.uischema.scope,
      input.control.value.rootSchema
  );
});

const dataLength = computed((): number => input.control.value.data?.length ?? 0);

const computedLabel = computed(() => {
  return computeLabel(
      input.control.value.label,
      input.control.value.required,
      !!input.appliedOptions.value?.hideRequiredAsterisk
  );
});

const getValidColumnProps = (scopedSchema: JsonSchema) => {
  if (
      scopedSchema.type === 'object' &&
      typeof scopedSchema.properties === 'object'
  ) {
    return Object.keys(scopedSchema.properties).filter(
        (prop) => scopedSchema.properties![prop].type !== 'array'
    );
  }
  // primitives
  return [''];
};

const title = (prop: string) => {
  return input.control.value.schema.properties?.[prop]?.title ?? _.startCase(prop);
};
const resolveUiSchema = (propName: string) => {
  return input.control.value.schema.properties
      ? controlWithoutLabel(`#/properties/${propName}`)
      : controlWithoutLabel('#');
};
const controlWithoutLabel = (scope: string): ControlElement => {
  return {type: 'Control', scope: scope, label: false};
};

const addButtonClick = () => {
  input.addItem(input.control.value.path, createDefaultValue(input.control.value.schema))();
};
const moveUpClick = (event: Event, toMove: number): void => {
  event.stopPropagation();
  input.moveUp?.(input.control.value.path, toMove)();
};
const moveDownClick = (event: Event, toMove: number): void => {
  event.stopPropagation();
  input.moveDown?.(input.control.value.path, toMove)();
};
const removeItemsClick = (event: Event, toDelete: number[]): void => {
  event.stopPropagation();
  input.removeItems?.(input.control.value.path, toDelete)();
};

</script>

<template>

  <!--  :class="styles.oneOf.root" -->
  <div class="oneOf" v-if="control.visible">

    <CompinatorProperties
        :schema="control.schema"
        combinatorKeyword="oneOf"
        :path="path"
    />

    <controlWrapper
        v-bind="controlWrapper"
        :styles="styles"
        :isFocused="isFocused"
        :appliedOptions="appliedOptions"
    >
      <select
          :id="control.id + '-input'"
          :class="styles.control.input"
          :disabled="!control.enabled"
          :autofocus="appliedOptions.focus"
          :required="control.required"
          v-model="selectIndex"
      >
        <option
            v-for="(item, index) in indexedOneOfRenderInfos"
            v-text="item.label"
            :value="index"
        />
      </select>

      <dispatch-renderer
          v-if="indexedOneOfRenderInfos && indexedOneOfRenderInfos[confirmedIndex]"
          :schema="indexedOneOfRenderInfos[confirmedIndex].schema"
          :uischema="indexedOneOfRenderInfos[confirmedIndex].uischema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
          :enabled="control.enabled"
      />
    </controlWrapper>

  </div>

</template>


<script lang="ts">
import {computed, defineComponent, ref,} from 'vue';
import {
  createAjv,
  createCombinatorRenderInfos,
  createDefaultValue,
  isOneOfControl,
  isVisible,  rankWith

} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsOneOfControl} from '@jsonforms/vue';
import type {RendererProps} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import CompinatorProperties from "./CompinatorProperties.vue";

const oneOfRenderer = defineComponent({
  name: 'one-of-select-renderer',
  methods: {isVisible},
  components: {ControlWrapper, CompinatorProperties, DispatchRenderer},
  props: {
    ...rendererProps<ControlElement>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/OneOfRenderer.vue
   */
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsOneOfControl(props);
    const control = (input.control as any).value as typeof input.control;

    const confirmedIndex = ref(control.indexOfFittingSchema);
    const selectIndex = ref(confirmedIndex.value);

    const ajv = createAjv();

    const indexedOneOfRenderInfos = computed(() => {
      return createCombinatorRenderInfos(
          control.schema.oneOf!,
          control.rootSchema,
          'oneOf',
          control.uischema,
          control.path,
          control.uischemas
      )
    })

    return {
      ...useVanillaControl(input),
      input,
      control,
      ajv,
      selectIndex,
      confirmedIndex,
      indexedOneOfRenderInfos
    };
  },
  watch: {
    selectIndex(newIndex, oldIndex) {
      if (this.control.enabled && this.confirmedIndex !== newIndex) {
        let confirmAlert = true;

        //:TODO read the current data (they are not in this.control.data!!!)
        const hasData = false;//!isEmpty(this.control.data);
        if(hasData) {
          confirmAlert = confirm("Your data will be cleared if you select this new option. Do you want to proceed?");
        }

        if (confirmAlert) {
          this.confirmedIndex = newIndex;
        } else {
          this.selectIndex = oldIndex;
        }
      }
    },
    confirmedIndex(newIndex) {
      const schema = this.indexedOneOfRenderInfos[newIndex]?.schema;
      this.handleChange(this.control.path, (schema && createDefaultValue(schema)) ?? {});
    }
  }
});

export default oneOfRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: oneOfRenderer,
  tester: rankWith(2, isOneOfControl)
};
</script>

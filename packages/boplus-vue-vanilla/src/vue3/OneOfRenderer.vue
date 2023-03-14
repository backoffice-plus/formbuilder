<template>

  <div :class="styles.oneOf.root" v-if="control.visible">

    <CombinatorProperties
        :schema="control.schema"
        combinatorKeyword="oneOf"
        :path="control.path"
    />

    <ControlWrapper
        v-bind="controlWrapper"
        :styles="styles"
        :isFocused="!!isFocused"
        :appliedOptions="appliedOptions"
    >
      <select
          :id="control.id + '-input'"
          :class="styles.oneOf.select"
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
    </ControlWrapper>

  </div>

</template>


<script lang="ts">
import {defineComponent, ref} from 'vue';
import isEmpty from 'lodash/isEmpty';

import CombinatorProperties from "./components/CombinatorProperties.vue";
import {useBoPlusVanillaControl} from "./utils";

import type {ControlElement} from '@jsonforms/core';
import {createCombinatorRenderInfos,  createDefaultValue,  isOneOfControl,  rankWith} from '@jsonforms/core';
import type {CombinatorSubSchemaRenderInfo,  JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import {DispatchRenderer, rendererProps, useJsonFormsOneOfControl,} from '@jsonforms/vue';
import type {RendererProps,} from '@jsonforms/vue';


/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/OneOfRenderer.vue
 */

const renderer = defineComponent({
  name: 'one-of-select-renderer',
  components: {
    DispatchRenderer,
    ControlWrapper,
    CombinatorProperties,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsOneOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const selectedIndex = ref(control.indexOfFittingSchema);
    //const selectIndex = ref(selectedIndex.value);
    // const newSelectedIndex = ref(0);
    // const dialog = ref(false);
    //const t = useTranslator();

    const confirmedIndex = ref(selectedIndex.value);
    const selectIndex = ref(confirmedIndex.value);

    return {
      ...useBoPlusVanillaControl(input),
      selectedIndex,
      selectIndex,
      // dialog,
      // newSelectedIndex,
      //t,
      confirmedIndex,
    };
  },
  computed: {
    indexedOneOfRenderInfos(): (CombinatorSubSchemaRenderInfo & {
      index: number;
    })[] {
      const result = createCombinatorRenderInfos(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.control.schema.oneOf!,
          this.control.rootSchema,
          'oneOf',
          this.control.uischema,
          this.control.path,
          this.control.uischemas
      );
      return result
          .filter((info) => info.uischema)
          .map((info, index) => ({...info, index: index}));
    },
  },
  methods: {
    // handleSelectChange(): void {
    //   if (this.control.enabled && !isEmpty(this.control.data)) {
    //     this.dialog = true;
    //     this.$nextTick(() => {
    //       this.newSelectedIndex = this.selectIndex;
    //       // revert the selection while the dialog is open
    //       this.selectIndex = this.selectedIndex;
    //     });
    //     // this.$nextTick does not work so use setTimeout
    //     setTimeout(() =>
    //         // cast to 'any' instead of 'Vue' because of Typescript problems (excessive stack depth when comparing types) during rollup build
    //         ((this.$refs.confirm as any).$el as HTMLElement).focus()
    //     );
    //   } else {
    //     this.$nextTick(() => {
    //       this.selectedIndex = this.selectIndex;
    //     });
    //   }
    // },
    // confirm(): void {
    //   this.newSelection();
    //   this.dialog = false;
    // },
    // cancel(): void {
    //   this.newSelectedIndex = this.selectedIndex;
    //   this.dialog = false;
    // },
    // newSelection(): void {
    //   this.handleChange(
    //       this.path,
    //       this.newSelectedIndex !== undefined && this.newSelectedIndex !== null
    //           ? createDefaultValue(
    //               this.indexedOneOfRenderInfos[this.newSelectedIndex].schema
    //           )
    //           : {}
    //   );
    //   this.selectIndex = this.newSelectedIndex;
    //   this.selectedIndex = this.newSelectedIndex;
    // },
  },


  watch: {
    selectIndex(newIndex, oldIndex) {
        if (this.control.enabled && this.confirmedIndex !== newIndex) {
          let confirmAlert = true;

          //:TODO read the current data (they are not in this.control.data!!!)
          const hasData = false;//!isEmpty(this.control.data);
          if (hasData) {
            confirmAlert = confirm("Your data will be cleared if you select this new option. Do you want to proceed?");
          }

          if (confirmAlert) {
            this.confirmedIndex = newIndex;
          } else {
            this.selectIndex = oldIndex;
          }
        }
    },

    confirmedIndex(newIndex, oldIndex) {
        /** @ts-ignore */
        const schema = this.indexedOneOfRenderInfos[newIndex]?.schema;
        this.handleChange(this.control.path, (schema && createDefaultValue(schema)) ?? {})
    }
  }
  // watch(selectIndex, (newIndex, oldIndex) => {
  //   if (input.control.value.enabled && confirmedIndex.value !== newIndex) {
  //     let confirmAlert = true;
  //
  //     //:TODO read the current data (they are not in this.control.data!!!)
  //     const hasData = false;//!isEmpty(this.control.data);
  //     if (hasData) {
  //       confirmAlert = confirm("Your data will be cleared if you select this new option. Do you want to proceed?");
  //     }
  //
  //     if (confirmAlert) {
  //       confirmedIndex.value = newIndex;
  //     } else {
  //       selectIndex.value = oldIndex;
  //     }
  //   }
  // });
  //
  // watch(confirmedIndex, (newIndex, oldIndex) => {
  //   /** @ts-ignore */
  //   const schema = indexedOneOfRenderInfos.value[newIndex]?.schema;
  //   input.handleChange(input.control.value.path, (schema && createDefaultValue(schema)) ?? {})
  // });


});

export default renderer;
export const entry = {
  renderer: renderer,
  tester: rankWith(3, isOneOfControl),
};


</script>

# BO+ Vue Vanilla Renderer

## Renderer sets

https://jsonforms.io/docs/renderer-sets

| JSON Schema           | Renderer         | overruled Renderer | Vue Vanilla | Vue2 Vuetify | Bo+ Vue Vanilla |
|-----------------------|------------------|:------------------:|:-----------:|:------------:|:---------------:|
| boolean               | Toggle           |      Boolean       |      ❌      |      ✔️      |       ✔️        |
| integer               | Slider           |      Integer       |      ❌      |     ✔️      |       ✔️        |
| string                | Password         |       String       |      ❌      |     ✔️      |       ✔️        |
| Enum                  | Autocomplete     |                    |      ❌      |     ✔️      |        ❓        |
| Enum                  | RadioGroup       |        Enum        |      ❌      |     ✔️      |       ✔️        |
| oneOf (const / title) | Autocomplete     |                    |      ❌      |     ✔️      |          ❓      |
| oneOf (const / title) | RadioGroup       |     EnumOneOf      |      ❌      |     ✔️      |       ✔️        |
| Object                | Vertical grid    |         ?          |      ❌      |     ✔️      |       ✔️        |
| Array of objects      | Table            |     ArrayList      |      ❌      |     ✔️      |       ✔️        |
| Array of objects      | List with Detail |     ArrayList      |      ❌      |     ✔️      |       ✔️        |
| Array of enums        | Multiple Choice  |     ArrayList      |      ❌      |     ✔️      |       ✔️        |
| oneOf                 | Tabs             |         -          |      ❌      |     ✔️      |       ✔️        |
| allOf                 | Tabs             |         -          |      ❌      |     ✔️      |       ✔️        |
| anyOf                 | Tabs             |         -          |      ❌      |     ✔️      |       ✔️        |
| Categorization        | Tabs             |         -          |      ❌      |     ✔️      |       ✔️        |

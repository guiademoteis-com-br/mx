import { computed } from 'vue'

export const PriceTable = {
  props: ['suite'],
  template: `
    <div class="habitacione-prices">
      <div class="habitacione-prices-box" v-for="group in groupedPrices" :key="group.title">
        <h3>{{ group.title }}</h3>
        <table>
          <tbody>
            <tr v-for="price in group.items" :key="price.id || (price.period + '-' + price.weekday + '-' + price.description)">
              <td>{{ price.weekday || 'Todos os dias' }}</td>
              <td>{{ price.description || 'Preço' }}</td>
              <td>{{ '$' + (price.value || '--') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" v-if="!hasPrices">
        Nenhum preço cadastrado para esta suíte.
      </div>
    </div>
  `,
  setup(props) {
    const groupedPrices = computed(() => {
      const prices = props.suite && Array.isArray(props.suite.prices) ? props.suite.prices : []
      if (!prices.length) return []
      return [{ title: 'Tarifas', items: prices }]
    })
    const hasPrices = computed(() => {
      const prices = props.suite && Array.isArray(props.suite.prices) ? props.suite.prices : []
      return prices.length > 0
    })

    return { groupedPrices, hasPrices }
  },
}

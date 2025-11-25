export const useRightTop = () => {
  const data = [
    { type: '武昌', value: 27 },
    { type: '汉口', value: 25 },
    { type: '汉阳', value: 18 },
    { type: '其他', value: 18 },
  ]
  const config = {
    appendPadding: 10,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
  type: 'outer',
  offset: 8,
  formatter: (datum) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const percent = ((datum.value / total) * 100).toFixed(1);
    return `${datum.type} ${percent}%`;
  },
  style: {
    fill: '#fff',
    fontSize: 12,
  }
},
    interactions: [{ type: 'element-active' }],
    data,
    height: 150,
    legend: {
      position: 'top',
      itemName: {
        style: {
          fill: '#fff',
        },
      },
    },
  }
  return {
    config,
  }
}


const schedulerFuchtions = [
    { label: '全部备份', value: 'full_backup'}
    , { label: '仅备份失败', value: 'failed_backup'}
    , { label: '刷新ARP', value: 'flush_arp'}
]


export const schedulerFuchtionsOptions = schedulerFuchtions.map((item) => ({
  label: item.label,
  value: item.value,
}))
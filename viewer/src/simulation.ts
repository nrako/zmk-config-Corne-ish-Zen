export type SimulationAction =
  | {kind:'modifier'; modifier:'alt'|'shift'|'ctrl'|'cmd'}
  | {kind:'layer'; name:string}
  | {kind:'output'; binding:string}
  | {kind:'none'}
export function simulationAction(binding:string, hold=false):SimulationAction {
 const [behavior,...args]=binding.split(' ')
 const modifier:Record<string,'alt'|'shift'|'ctrl'|'cmd'>={LALT:'alt',RALT:'alt',LSHFT:'shift',RSHFT:'shift',LCTRL:'ctrl',RCTRL:'ctrl',LGUI:'cmd',RGUI:'cmd'}
 if(behavior==='&none')return {kind:'none'}
 if(behavior==='&rshiftcap')return {kind:'modifier',modifier:'shift'}
 if(behavior==='&kp'&&modifier[args[0]])return {kind:'modifier',modifier:modifier[args[0]]}
 if(['&mo','&sl','&tog','&to'].includes(behavior)||(behavior==='&lt'&&hold))return {kind:'layer',name:args[0]}
 if(behavior==='&lt'||behavior==='&mt')return simulationAction(`&kp ${args[hold?0:1]}`)
 return {kind:'output',binding}
}

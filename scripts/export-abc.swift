import Carbon
import Foundation
let input = TISCopyCurrentKeyboardLayoutInputSource().takeRetainedValue()
let name = Unmanaged<CFString>.fromOpaque(TISGetInputSourceProperty(input, kTISPropertyInputSourceID)).takeUnretainedValue() as String
guard name == "com.apple.keylayout.ABC" else { fatalError("Select the ABC keyboard layout before exporting") }
let data = Unmanaged<CFData>.fromOpaque(TISGetInputSourceProperty(input, kTISPropertyUnicodeKeyLayoutData)).takeUnretainedValue()
let layout = UnsafeRawPointer(CFDataGetBytePtr(data)).assumingMemoryBound(to: UCKeyboardLayout.self)
var result: [String: [[String: Any]]] = [:]
for code in [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,50] {
 var entries: [[String: Any]] = []
 for flags in [0, shiftKey, optionKey, shiftKey | optionKey] {
  var state: UInt32 = 0
  var length = 0
  var chars = [UniChar](repeating: 0, count: 16)
  let status = UCKeyTranslate(layout, UInt16(code), UInt16(kUCKeyActionDown), UInt32(flags >> 8), UInt32(LMGetKbdType()), 0, &state, 16, &length, &chars)
  guard status == noErr else { fatalError("UCKeyTranslate failed") }
  let dead = state != 0
  if dead {
   state = 0
   _ = UCKeyTranslate(layout, UInt16(code), UInt16(kUCKeyActionDown), UInt32(flags >> 8), UInt32(LMGetKbdType()), OptionBits(kUCKeyTranslateNoDeadKeysMask), &state, 16, &length, &chars)
  }
  entries.append(["text": String(utf16CodeUnits: chars, count: length), "dead": dead])
 }
 result[String(code)] = entries
}
let output: [String: Any] = ["source": name, "keys": result]
let json = try JSONSerialization.data(withJSONObject: output, options: [.sortedKeys,.prettyPrinted])
print(String(data:json,encoding:.utf8)!)

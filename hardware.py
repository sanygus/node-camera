#!/usr/bin/python

import smbus,subprocess,time

while(True):
  time.sleep(1)
  try:
    file1 = open("/tmp/voltage","w")
    smbus.SMBus(1).write_byte(0x08, 251)
    val1 = smbus.SMBus(1).read_byte(0x08) + 0.0
    file1.write(repr(val1 * 4 * 5 / 1024))
    file1.close()

    file2 = open("/tmp/amperage","w")
    smbus.SMBus(1).write_byte(0x08, 252)
    val2 = smbus.SMBus(1).read_byte(0x08) + 0.0
    file2.write(repr(val2 * 4 * 5 / 1024))
    file2.close()

    file3 = open("/tmp/sleepSec","r")
    ch = int(file3.read())
    file3.close()
    file3 = open("/tmp/sleepSec","w")
    file3.write("0");
    file3.close()
    smbus.SMBus(1).write_byte(0x08, 253)
    smbus.SMBus(1).write_byte(0x08, ch // 250)
    smbus.SMBus(1).write_byte(0x08, 254)
    smbus.SMBus(1).write_byte(0x08, ch % 250)
    if ch > 0:
	smbus.SMBus(1).write_byte(0x08, 255)
        subprocess.check_output("shutdown -h now",shell=True)

  except IOError:
    file = open("/tmp/voltage","w")
    file1 = open("/tmp/amperage","w")
    file.write("0.1")
    file1.write("0.1")
    file.close()
    file1.close()
    print("IOError")


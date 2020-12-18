import json

class Command:
    tInput = ""
    aInput = ""
    trigger = ""
    action = ""
    isRule = False

    def __init__(self, isRule):
        self.isRule = isRule

    # def isRule(self):
    #     if
    def toDict(self, parsedInput):
        parsedInput["trigger"] = self.trigger
        parsedInput["action"] = self.action
        parsedInput["isRule"] = self.isRule
        return parsedInput

    def setTrigger(self, tInput):
        self.tInput = tInput
        if "door" in tInput:
            self.trigger = "DOOR"
            # print("DOOR")

    def setAction(self, aInput):
        self.aInput = aInput
        if "alarm" in aInput:
            self.action = "ALARM"
            # print("ALARM")

def inputResponse(parsedInput):
    isRule =  (parsedInput["if"]  != "" and parsedInput["then"]  != "")
    newCommand = Command(isRule)
    newCommand.setTrigger(parsedInput["if"])
    newCommand.setAction(parsedInput["then"])
    print(newCommand.isRule)
    print(newCommand.action)
    print(json.dumps(newCommand.toDict(parsedInput)))


def parse(str):
    if "when" in str:
        ifSentence = str.split("when")[1].strip()
        thenSentence = str.split("when")[0].strip()
    elif "if" in str:
        ifSentence = str.split("then")[0].strip().split("if")[1].strip()
        thenSentence = str.split("then")[1].strip()
    else:
        ifSentence = ""
        thenSentence = str
    parsedInput = {"if": ifSentence, "then": thenSentence}
    return parsedInput

# parse("make an alarm sound when someone is at the door")
p=parse("make an alarm sound")
# p=parse("if someone is at the door then make an alarm sound")

inputResponse(p)
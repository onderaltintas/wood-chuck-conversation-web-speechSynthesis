/*Vocal Cords class*/
var VocalCords = function(){
  this.sentenceEndCallback = function(e){
    console.log("vocal cords sentence end callback")
  };
  this.msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  this.msg.voice = voices[0]; // Note: some voices don't support altering params
  this.msg.voiceURI = 'native';
  this.msg.volume = 1; // 0 to 1
  this.msg.rate = 1; // 0.1 to 10
  this.msg.pitch = 2; //0 to 2
  this.msg.lang = 'en-US';
  var self = this;
  this.msg.onend = function(e) {
    self.sentenceEndCallback(e);
    console.log('Finished in ' + event.elapsedTime + ' seconds.');
  };
}

VocalCords.prototype.setSentenceEndCallback = function(callback) {
  this.sentenceEndCallback = callback;
}

VocalCords.prototype.speak = function(sentence, voiceTone){
    this.msg.text = sentence;
    this.msg.pitch = voiceTone;
    speechSynthesis.speak(this.msg);
}

/*Person class*/
var Person = function(name, voiceTone, vocalCords){
  this.name = name;
  this.voiceTone = voiceTone;
  this.vocalCords = vocalCords;
  this.currentSentenceIndex = 0;
  this.sentences = [];
  this.conversationEndCallback = function(){
    console.log(name+' ended his/her conversation');
  }
  
  this.sentenceEndCallback = function(){
    console.log("person" + name + " sentence end callback");
  }
  
  this.vocalCords.setSentenceEndCallback(this.sentenceEndCallback);
}

Person.prototype.addSentence = function(sentence){
  this.sentences.push(sentence);
}

Person.prototype.setSentences = function(sentences){
  this.sentences = sentences;
  this.currentSentenceIndex = 0;
}

Person.prototype.speak = function(){
  var currentSentence = this.sentences[this.currentSentenceIndex];
  this.vocalCords.speak(currentSentence, this.voiceTone);
  var conversationDiv = document.getElementById("conversation");
  conversationDiv.innerHTML += "<div><b>" + this.name + "</b>: " + currentSentence + "</div>";
  this.currentSentenceIndex = (this.currentSentenceIndex + 1) % this.sentences.length;
  if(this.currentSentenceIndex === 0) {
    this.conversationEndCallback();
  }
}

Person.prototype.setConversationEndCallback = function(callback) {
  this.conversationEndCallback = callback;
}

Person.prototype.setSentenceEndCallback = function(callback){
  this.vocalCords.setSentenceEndCallback(callback);
}

/*Scene class*/
var Scene = function(people){
  this.people = people;
  this.conversationEndCounter = 0;
  this.personIndex = 0;
  var self = this;
  var conversationEndCallback = function(){
    self.conversationEndCounter++;
  }
  
  for(var i = 0; i < people.length; i++){
    people[i].setConversationEndCallback(conversationEndCallback);
  }
}

Scene.prototype.start = function(){
  this.nextTalk();
}

Scene.prototype.nextTalk = function(){
  var currentPerson = this.people[this.personIndex];
  var self = this;
  currentPerson.setSentenceEndCallback(function(e){
    if(self.conversationEndCounter === self.people.length) {
      return;
    }
    
    self.personIndex = (self.personIndex + 1)  % self.people.length;
    self.nextTalk();    
  });
  
  currentPerson.speak();
}

/*Program class*/
var Program = function(){
}

Program.prototype.run = function(){
  var vocalCords = new VocalCords();
  var guybrush = new Person('Guybrush', 0.1, vocalCords);
  var carpenter = new Person('Carpenter', 2, vocalCords);
  guybrush.setSentences(['How much wood could a woodchuck chuck if a woodchuck could chuck wood?','But if a woodchuck could chuck and would chuck some amount of wood, what amount of wood would a woodchuck chuck?','A woodchuck should chuck if a woodchuck could chuck wood, as long as a woodchuck would chuck wood.']);
  carpenter.setSentences(['A woodchuck would chuck no amount of wood since a woodchuck can\'t chuck wood.','Even if a woodchuck could chuck wood and even if a woodchuck would chuck wood, should a woodchuck chuck wood?','Oh shut up.']);
  var scene = new Scene([guybrush, carpenter]);
  scene.start();
}

/*Execution*/
document.body.onload = function(){
  var program = new Program();
  program.run();  
}
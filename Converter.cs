using System.IO;
using System.Xml;
using Xbim.Ifc;
using Xbim.IO.Xml;
using Xbim.ModelGeometry.Scene;

var input = args[0];
var wexbimOutput = args[1];
var xmlOutput = args[2];

using var model = IfcStore.Open(input);

var context = new Xbim3DModelContext(model);
context.CreateContext(null, false);

System.Console.WriteLine("""{"logger": "wexbim", "msg": "Converting to WEXBIM now."}""");
System.Console.WriteLine("""{"logger": "wexbim", "msg": "This may take some minutes."}""");
using var wexBimFile = File.Create(wexbimOutput);
using var wexBimBinaryWriter = new BinaryWriter(wexBimFile);
model.SaveAsWexBim(wexBimBinaryWriter);
System.Console.WriteLine("""{"logger": "wexbim", "msg": "Conversion done."}""");

System.Console.WriteLine("""{"logger": "xml", "msg": "Converting to XML now."}""");
System.Console.WriteLine("""{"logger": "xml", "msg": "This may take several minutes."}""");
using var xmlFile = File.Create(xmlOutput);
var xmlSettings = new XmlWriterSettings { Indent = true };
using var xmlWriter = XmlWriter.Create(xmlFile, xmlSettings);
var xbimXmlWriter = new XbimXmlWriter4(XbimXmlSettings.IFC4);
xbimXmlWriter.Write(model, xmlWriter);
System.Console.WriteLine("""{"logger": "xml", "msg": "Conversion done."}""");

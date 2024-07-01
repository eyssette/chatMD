function krokiCreateImageFromSource(type, source) {
	const dataKroki = new TextEncoder("utf-8").encode(source);
	const dataKrokiCompressed = pako.deflate(dataKroki, {
		level: 9,
		to: "string",
	});
	const dataKrokiCompressedFormatted = btoa(dataKrokiCompressed)
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
	const urlImage = 'https://kroki.io/'+type+'/svg/'+dataKrokiCompressedFormatted;
	const image = '![]('+urlImage+')';
	return image;
}

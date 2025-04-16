In Austria, the VAT rate is {{20%}}{vatRate}, but for food, it is only {{10%}}{vatRateFood}.

|Item|Base Price|Amount|Total|
|----|----------|------|-----|
|Apple|{{1.25 €}}|5|{{[col-2,row]*[col-1,row]}}|
|Orange|{{1.3 €}}|5|{{[col-2,row]*[col-1,row]}}|
|Net Food|||{{sum [col, 1]:[col, row-1]}}|
|VAT Food||{{vatRateFood}}|{{[col, row-1]*[col-1, row]}}|
|Subtotal Food|||{{[col,row-2]+[col,row-1]}}|{highlight=subresult}
|Hand Sanitizer|{{5.99 €}}|2|{{[col-2,row]*[col-1,row]}}|
|Soap|{{2.99 €}}|3|{{[col-2,row]*[col-1,row]}}|
|Net Non-Food|||{{sum [col, row-2]:[col, row-1]}}|
|VAT Non-Food||{{vatRate}}|{{[col, row-1]*[col-1, row]}}|
|Subtotal Non-Food|||{{[col,row-2]+[col,row-1]}}|{highlight=subresult}
|Total|||{{[col, row-1]+[col, row-3]}}|{highlight=result}

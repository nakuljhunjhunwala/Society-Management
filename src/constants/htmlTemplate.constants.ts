export const maintenanceRecieptTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
            color: #2c3e50;
        }
        .receipt-no {
            color: #7f8c8d;
            font-size: 14px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .info-block {
            flex: 1;
            margin: 0 15px;
        }
        .info-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .details {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f6fa;
            color: #2c3e50;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #333;
        }
        .payment-status {
            margin-top: 20px;
            padding: 10px;
            background-color: #e8f5e9;
            border-radius: 4px;
            text-align: center;
            color: #2e7d32;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        .discount-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff3e0;
            border-radius: 4px;
        }
        .discount-title {
            font-weight: bold;
            color: #e65100;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="/api/placeholder/100/100" alt="Society Logo" style="width: 100px; height: 100px;">
        <div class="receipt-title">{{societyName}}</div>
        <div>{{societyAddress}}</div>
    </div>

    <div class="info-section">
        <div class="info-block">
            <div class="info-title">Received From:</div>
            <div>{{payerName}}</div>
            <div>Flat No: {{flatNo}}</div>
        </div>
        <div class="info-block">
            <div class="info-title">Payment Details:</div>
            <div>Date: October 29, 2024</div>
            <div>Payment Mode: {{paymentMode}}</div>
        </div>
    </div>

    <div class="details">
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Monthly Maintenance</td>
                    <td>{{from}}</td>
                    <td>{{to}}</td>
                    <td>{{paid}}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="total-section">
        <div style="font-size: 20px; font-weight: bold;">
            <strong>Final Amount:</strong> {{finalAmount}}
        </div>
    </div>

    <div class="payment-status">
        Payment Status: PAID
    </div>

    <div class="footer">
        <p>This is a computer-generated receipt and doesn't require a signature.</p>
    </div>
</body>
</html>
`
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_create_input_dto_rules_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareCreateInputDtoRulesInnerSeatTypeEnum
    _$fareCreateInputDtoRulesInnerSeatTypeEnum_SEAT =
    const FareCreateInputDtoRulesInnerSeatTypeEnum._('SEAT');
const FareCreateInputDtoRulesInnerSeatTypeEnum
    _$fareCreateInputDtoRulesInnerSeatTypeEnum_BED =
    const FareCreateInputDtoRulesInnerSeatTypeEnum._('BED');

FareCreateInputDtoRulesInnerSeatTypeEnum
    _$fareCreateInputDtoRulesInnerSeatTypeEnumValueOf(String name) {
  switch (name) {
    case 'SEAT':
      return _$fareCreateInputDtoRulesInnerSeatTypeEnum_SEAT;
    case 'BED':
      return _$fareCreateInputDtoRulesInnerSeatTypeEnum_BED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareCreateInputDtoRulesInnerSeatTypeEnum>
    _$fareCreateInputDtoRulesInnerSeatTypeEnumValues = BuiltSet<
        FareCreateInputDtoRulesInnerSeatTypeEnum>(const <FareCreateInputDtoRulesInnerSeatTypeEnum>[
  _$fareCreateInputDtoRulesInnerSeatTypeEnum_SEAT,
  _$fareCreateInputDtoRulesInnerSeatTypeEnum_BED,
]);

Serializer<FareCreateInputDtoRulesInnerSeatTypeEnum>
    _$fareCreateInputDtoRulesInnerSeatTypeEnumSerializer =
    _$FareCreateInputDtoRulesInnerSeatTypeEnumSerializer();

class _$FareCreateInputDtoRulesInnerSeatTypeEnumSerializer
    implements PrimitiveSerializer<FareCreateInputDtoRulesInnerSeatTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    FareCreateInputDtoRulesInnerSeatTypeEnum
  ];
  @override
  final String wireName = 'FareCreateInputDtoRulesInnerSeatTypeEnum';

  @override
  Object serialize(Serializers serializers,
          FareCreateInputDtoRulesInnerSeatTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareCreateInputDtoRulesInnerSeatTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareCreateInputDtoRulesInnerSeatTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareCreateInputDtoRulesInner extends FareCreateInputDtoRulesInner {
  @override
  final String? vehicleTypeId;
  @override
  final FareCreateInputDtoRulesInnerSeatTypeEnum? seatType;
  @override
  final DateTime? validFrom;
  @override
  final DateTime? validTo;
  @override
  final int price;

  factory _$FareCreateInputDtoRulesInner(
          [void Function(FareCreateInputDtoRulesInnerBuilder)? updates]) =>
      (FareCreateInputDtoRulesInnerBuilder()..update(updates))._build();

  _$FareCreateInputDtoRulesInner._(
      {this.vehicleTypeId,
      this.seatType,
      this.validFrom,
      this.validTo,
      required this.price})
      : super._();
  @override
  FareCreateInputDtoRulesInner rebuild(
          void Function(FareCreateInputDtoRulesInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareCreateInputDtoRulesInnerBuilder toBuilder() =>
      FareCreateInputDtoRulesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareCreateInputDtoRulesInner &&
        vehicleTypeId == other.vehicleTypeId &&
        seatType == other.seatType &&
        validFrom == other.validFrom &&
        validTo == other.validTo &&
        price == other.price;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, vehicleTypeId.hashCode);
    _$hash = $jc(_$hash, seatType.hashCode);
    _$hash = $jc(_$hash, validFrom.hashCode);
    _$hash = $jc(_$hash, validTo.hashCode);
    _$hash = $jc(_$hash, price.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FareCreateInputDtoRulesInner')
          ..add('vehicleTypeId', vehicleTypeId)
          ..add('seatType', seatType)
          ..add('validFrom', validFrom)
          ..add('validTo', validTo)
          ..add('price', price))
        .toString();
  }
}

class FareCreateInputDtoRulesInnerBuilder
    implements
        Builder<FareCreateInputDtoRulesInner,
            FareCreateInputDtoRulesInnerBuilder> {
  _$FareCreateInputDtoRulesInner? _$v;

  String? _vehicleTypeId;
  String? get vehicleTypeId => _$this._vehicleTypeId;
  set vehicleTypeId(String? vehicleTypeId) =>
      _$this._vehicleTypeId = vehicleTypeId;

  FareCreateInputDtoRulesInnerSeatTypeEnum? _seatType;
  FareCreateInputDtoRulesInnerSeatTypeEnum? get seatType => _$this._seatType;
  set seatType(FareCreateInputDtoRulesInnerSeatTypeEnum? seatType) =>
      _$this._seatType = seatType;

  DateTime? _validFrom;
  DateTime? get validFrom => _$this._validFrom;
  set validFrom(DateTime? validFrom) => _$this._validFrom = validFrom;

  DateTime? _validTo;
  DateTime? get validTo => _$this._validTo;
  set validTo(DateTime? validTo) => _$this._validTo = validTo;

  int? _price;
  int? get price => _$this._price;
  set price(int? price) => _$this._price = price;

  FareCreateInputDtoRulesInnerBuilder() {
    FareCreateInputDtoRulesInner._defaults(this);
  }

  FareCreateInputDtoRulesInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _vehicleTypeId = $v.vehicleTypeId;
      _seatType = $v.seatType;
      _validFrom = $v.validFrom;
      _validTo = $v.validTo;
      _price = $v.price;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareCreateInputDtoRulesInner other) {
    _$v = other as _$FareCreateInputDtoRulesInner;
  }

  @override
  void update(void Function(FareCreateInputDtoRulesInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareCreateInputDtoRulesInner build() => _build();

  _$FareCreateInputDtoRulesInner _build() {
    final _$result = _$v ??
        _$FareCreateInputDtoRulesInner._(
          vehicleTypeId: vehicleTypeId,
          seatType: seatType,
          validFrom: validFrom,
          validTo: validTo,
          price: BuiltValueNullFieldError.checkNotNull(
              price, r'FareCreateInputDtoRulesInner', 'price'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

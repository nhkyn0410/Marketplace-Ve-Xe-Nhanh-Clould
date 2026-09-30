// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_response_dto_output_rules_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareResponseDtoOutputRulesInnerSeatTypeEnum
    _$fareResponseDtoOutputRulesInnerSeatTypeEnum_SEAT =
    const FareResponseDtoOutputRulesInnerSeatTypeEnum._('SEAT');
const FareResponseDtoOutputRulesInnerSeatTypeEnum
    _$fareResponseDtoOutputRulesInnerSeatTypeEnum_BED =
    const FareResponseDtoOutputRulesInnerSeatTypeEnum._('BED');

FareResponseDtoOutputRulesInnerSeatTypeEnum
    _$fareResponseDtoOutputRulesInnerSeatTypeEnumValueOf(String name) {
  switch (name) {
    case 'SEAT':
      return _$fareResponseDtoOutputRulesInnerSeatTypeEnum_SEAT;
    case 'BED':
      return _$fareResponseDtoOutputRulesInnerSeatTypeEnum_BED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareResponseDtoOutputRulesInnerSeatTypeEnum>
    _$fareResponseDtoOutputRulesInnerSeatTypeEnumValues = BuiltSet<
        FareResponseDtoOutputRulesInnerSeatTypeEnum>(const <FareResponseDtoOutputRulesInnerSeatTypeEnum>[
  _$fareResponseDtoOutputRulesInnerSeatTypeEnum_SEAT,
  _$fareResponseDtoOutputRulesInnerSeatTypeEnum_BED,
]);

Serializer<FareResponseDtoOutputRulesInnerSeatTypeEnum>
    _$fareResponseDtoOutputRulesInnerSeatTypeEnumSerializer =
    _$FareResponseDtoOutputRulesInnerSeatTypeEnumSerializer();

class _$FareResponseDtoOutputRulesInnerSeatTypeEnumSerializer
    implements
        PrimitiveSerializer<FareResponseDtoOutputRulesInnerSeatTypeEnum> {
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
    FareResponseDtoOutputRulesInnerSeatTypeEnum
  ];
  @override
  final String wireName = 'FareResponseDtoOutputRulesInnerSeatTypeEnum';

  @override
  Object serialize(Serializers serializers,
          FareResponseDtoOutputRulesInnerSeatTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareResponseDtoOutputRulesInnerSeatTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareResponseDtoOutputRulesInnerSeatTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareResponseDtoOutputRulesInner
    extends FareResponseDtoOutputRulesInner {
  @override
  final String? vehicleTypeId;
  @override
  final FareResponseDtoOutputRulesInnerSeatTypeEnum? seatType;
  @override
  final DateTime? validFrom;
  @override
  final DateTime? validTo;
  @override
  final int price;

  factory _$FareResponseDtoOutputRulesInner(
          [void Function(FareResponseDtoOutputRulesInnerBuilder)? updates]) =>
      (FareResponseDtoOutputRulesInnerBuilder()..update(updates))._build();

  _$FareResponseDtoOutputRulesInner._(
      {this.vehicleTypeId,
      this.seatType,
      this.validFrom,
      this.validTo,
      required this.price})
      : super._();
  @override
  FareResponseDtoOutputRulesInner rebuild(
          void Function(FareResponseDtoOutputRulesInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareResponseDtoOutputRulesInnerBuilder toBuilder() =>
      FareResponseDtoOutputRulesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareResponseDtoOutputRulesInner &&
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
    return (newBuiltValueToStringHelper(r'FareResponseDtoOutputRulesInner')
          ..add('vehicleTypeId', vehicleTypeId)
          ..add('seatType', seatType)
          ..add('validFrom', validFrom)
          ..add('validTo', validTo)
          ..add('price', price))
        .toString();
  }
}

class FareResponseDtoOutputRulesInnerBuilder
    implements
        Builder<FareResponseDtoOutputRulesInner,
            FareResponseDtoOutputRulesInnerBuilder> {
  _$FareResponseDtoOutputRulesInner? _$v;

  String? _vehicleTypeId;
  String? get vehicleTypeId => _$this._vehicleTypeId;
  set vehicleTypeId(String? vehicleTypeId) =>
      _$this._vehicleTypeId = vehicleTypeId;

  FareResponseDtoOutputRulesInnerSeatTypeEnum? _seatType;
  FareResponseDtoOutputRulesInnerSeatTypeEnum? get seatType => _$this._seatType;
  set seatType(FareResponseDtoOutputRulesInnerSeatTypeEnum? seatType) =>
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

  FareResponseDtoOutputRulesInnerBuilder() {
    FareResponseDtoOutputRulesInner._defaults(this);
  }

  FareResponseDtoOutputRulesInnerBuilder get _$this {
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
  void replace(FareResponseDtoOutputRulesInner other) {
    _$v = other as _$FareResponseDtoOutputRulesInner;
  }

  @override
  void update(void Function(FareResponseDtoOutputRulesInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareResponseDtoOutputRulesInner build() => _build();

  _$FareResponseDtoOutputRulesInner _build() {
    final _$result = _$v ??
        _$FareResponseDtoOutputRulesInner._(
          vehicleTypeId: vehicleTypeId,
          seatType: seatType,
          validFrom: validFrom,
          validTo: validTo,
          price: BuiltValueNullFieldError.checkNotNull(
              price, r'FareResponseDtoOutputRulesInner', 'price'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

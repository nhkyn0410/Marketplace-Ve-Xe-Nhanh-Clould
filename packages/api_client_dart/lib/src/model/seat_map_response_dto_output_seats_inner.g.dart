// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_response_dto_output_seats_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SeatMapResponseDtoOutputSeatsInnerTypeEnum
    _$seatMapResponseDtoOutputSeatsInnerTypeEnum_SEAT =
    const SeatMapResponseDtoOutputSeatsInnerTypeEnum._('SEAT');
const SeatMapResponseDtoOutputSeatsInnerTypeEnum
    _$seatMapResponseDtoOutputSeatsInnerTypeEnum_BED =
    const SeatMapResponseDtoOutputSeatsInnerTypeEnum._('BED');

SeatMapResponseDtoOutputSeatsInnerTypeEnum
    _$seatMapResponseDtoOutputSeatsInnerTypeEnumValueOf(String name) {
  switch (name) {
    case 'SEAT':
      return _$seatMapResponseDtoOutputSeatsInnerTypeEnum_SEAT;
    case 'BED':
      return _$seatMapResponseDtoOutputSeatsInnerTypeEnum_BED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SeatMapResponseDtoOutputSeatsInnerTypeEnum>
    _$seatMapResponseDtoOutputSeatsInnerTypeEnumValues = BuiltSet<
        SeatMapResponseDtoOutputSeatsInnerTypeEnum>(const <SeatMapResponseDtoOutputSeatsInnerTypeEnum>[
  _$seatMapResponseDtoOutputSeatsInnerTypeEnum_SEAT,
  _$seatMapResponseDtoOutputSeatsInnerTypeEnum_BED,
]);

Serializer<SeatMapResponseDtoOutputSeatsInnerTypeEnum>
    _$seatMapResponseDtoOutputSeatsInnerTypeEnumSerializer =
    _$SeatMapResponseDtoOutputSeatsInnerTypeEnumSerializer();

class _$SeatMapResponseDtoOutputSeatsInnerTypeEnumSerializer
    implements PrimitiveSerializer<SeatMapResponseDtoOutputSeatsInnerTypeEnum> {
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
    SeatMapResponseDtoOutputSeatsInnerTypeEnum
  ];
  @override
  final String wireName = 'SeatMapResponseDtoOutputSeatsInnerTypeEnum';

  @override
  Object serialize(Serializers serializers,
          SeatMapResponseDtoOutputSeatsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  SeatMapResponseDtoOutputSeatsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      SeatMapResponseDtoOutputSeatsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$SeatMapResponseDtoOutputSeatsInner
    extends SeatMapResponseDtoOutputSeatsInner {
  @override
  final String code;
  @override
  final int deck;
  @override
  final int row;
  @override
  final int column;
  @override
  final SeatMapResponseDtoOutputSeatsInnerTypeEnum type;

  factory _$SeatMapResponseDtoOutputSeatsInner(
          [void Function(SeatMapResponseDtoOutputSeatsInnerBuilder)?
              updates]) =>
      (SeatMapResponseDtoOutputSeatsInnerBuilder()..update(updates))._build();

  _$SeatMapResponseDtoOutputSeatsInner._(
      {required this.code,
      required this.deck,
      required this.row,
      required this.column,
      required this.type})
      : super._();
  @override
  SeatMapResponseDtoOutputSeatsInner rebuild(
          void Function(SeatMapResponseDtoOutputSeatsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapResponseDtoOutputSeatsInnerBuilder toBuilder() =>
      SeatMapResponseDtoOutputSeatsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapResponseDtoOutputSeatsInner &&
        code == other.code &&
        deck == other.deck &&
        row == other.row &&
        column == other.column &&
        type == other.type;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, deck.hashCode);
    _$hash = $jc(_$hash, row.hashCode);
    _$hash = $jc(_$hash, column.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapResponseDtoOutputSeatsInner')
          ..add('code', code)
          ..add('deck', deck)
          ..add('row', row)
          ..add('column', column)
          ..add('type', type))
        .toString();
  }
}

class SeatMapResponseDtoOutputSeatsInnerBuilder
    implements
        Builder<SeatMapResponseDtoOutputSeatsInner,
            SeatMapResponseDtoOutputSeatsInnerBuilder> {
  _$SeatMapResponseDtoOutputSeatsInner? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  int? _deck;
  int? get deck => _$this._deck;
  set deck(int? deck) => _$this._deck = deck;

  int? _row;
  int? get row => _$this._row;
  set row(int? row) => _$this._row = row;

  int? _column;
  int? get column => _$this._column;
  set column(int? column) => _$this._column = column;

  SeatMapResponseDtoOutputSeatsInnerTypeEnum? _type;
  SeatMapResponseDtoOutputSeatsInnerTypeEnum? get type => _$this._type;
  set type(SeatMapResponseDtoOutputSeatsInnerTypeEnum? type) =>
      _$this._type = type;

  SeatMapResponseDtoOutputSeatsInnerBuilder() {
    SeatMapResponseDtoOutputSeatsInner._defaults(this);
  }

  SeatMapResponseDtoOutputSeatsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _deck = $v.deck;
      _row = $v.row;
      _column = $v.column;
      _type = $v.type;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapResponseDtoOutputSeatsInner other) {
    _$v = other as _$SeatMapResponseDtoOutputSeatsInner;
  }

  @override
  void update(
      void Function(SeatMapResponseDtoOutputSeatsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapResponseDtoOutputSeatsInner build() => _build();

  _$SeatMapResponseDtoOutputSeatsInner _build() {
    final _$result = _$v ??
        _$SeatMapResponseDtoOutputSeatsInner._(
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'SeatMapResponseDtoOutputSeatsInner', 'code'),
          deck: BuiltValueNullFieldError.checkNotNull(
              deck, r'SeatMapResponseDtoOutputSeatsInner', 'deck'),
          row: BuiltValueNullFieldError.checkNotNull(
              row, r'SeatMapResponseDtoOutputSeatsInner', 'row'),
          column: BuiltValueNullFieldError.checkNotNull(
              column, r'SeatMapResponseDtoOutputSeatsInner', 'column'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'SeatMapResponseDtoOutputSeatsInner', 'type'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
